"use client";

import { useState, useMemo } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import { useOrganizations } from "@/lib/useOrganizations";
import { hapticSuccess } from "@/lib/haptics";
import { localDateStr, fmtHours, round2 } from "@/lib/dates";
import { ORG_TYPES } from "@/data/types";

export const PRIOR_UNSPECIFIED_SLUG = "prior-unspecified";
export const PRIOR_UNSPECIFIED_NAME = "Unspecified organization";
const PRIOR_UNSPECIFIED_TYPE = "Other";

const OTHER = "__other__";
// Sanity ceiling. numeric(7,2) tops out at 99999.99; this catches typos long
// before the column does.
const MAX_TOTAL = 20000;
// Anything within this many hours of the total counts as fully assigned, so
// rounding dust like 33.33 x 3 does not spawn a 0.01 hour leftover entry.
const EPS = 0.05;

interface PriorHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Hours already imported as prior, so the modal can warn about duplicates. */
  existingPriorHours?: number;
}

interface Row {
  key: string;
  orgSlug: string; // "" | a real org slug | OTHER
  customName: string;
  customType: string;
  hours: string;
  date: string;
}

interface ResolvedRow {
  name: string;
  slug: string;
  type: string;
  hours: number;
  date: string;
}

let rowCounter = 0;
function makeRow(): Row {
  rowCounter += 1;
  return {
    key: `row-${rowCounter}`,
    orgSlug: "",
    customName: "",
    customType: "Community",
    hours: "",
    date: localDateStr(),
  };
}

/**
 * Matches the slug format LogHourModal uses for custom orgs exactly, so a
 * prior-hours entry and a normally logged entry for the same custom org name
 * group together in the analytics rather than splitting into two orgs.
 */
function customSlug(name: string): string {
  return (
    "custom-" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "")
  );
}

export default function PriorHoursModal({
  isOpen,
  onClose,
  onSaved,
  existingPriorHours = 0,
}: PriorHoursModalProps) {
  const { user } = useAuth();
  const { organizations: allOrgs } = useOrganizations();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [totalInput, setTotalInput] = useState("");
  const [rows, setRows] = useState<Row[]>([makeRow()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = parseFloat(totalInput);
  const totalValid = !isNaN(total) && total > 0 && total <= MAX_TOTAL;

  const assigned = useMemo(
    () =>
      round2(
        rows.reduce((sum, r) => {
          const h = parseFloat(r.hours);
          return sum + (isNaN(h) || h <= 0 ? 0 : h);
        }, 0)
      ),
    [rows]
  );

  const remaining = totalValid ? round2(total - assigned) : 0;
  const overAssigned = remaining < -EPS;

  // Slugs already claimed, so a known org cannot be picked twice. OTHER is
  // deliberately never claimed, so multiple custom orgs are allowed.
  const claimedSlugs = useMemo(
    () => rows.map((r) => r.orgSlug).filter((s) => s && s !== OTHER),
    [rows]
  );

  if (!isOpen || !user) return null;

  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setError("");
  };

  const removeRow = (key: string) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.key !== key)));
    setError("");
  };

  const resetAll = () => {
    setStep(1);
    setTotalInput("");
    setRows([makeRow()]);
    setError("");
  };

  /** Turns the form rows into insertable records, or returns an error string. */
  const resolveRows = (): { resolved: ResolvedRow[] } | { error: string } => {
    const resolved: ResolvedRow[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const position = `Organization ${i + 1}`;

      if (!r.orgSlug) return { error: `${position}: pick an organization.` };

      let name: string;
      let slug: string;
      let type: string;

      if (r.orgSlug === OTHER) {
        const trimmed = r.customName.trim();
        if (!trimmed) return { error: `${position}: enter the organization name.` };
        name = trimmed;
        slug = customSlug(trimmed);
        type = r.customType;
      } else {
        const org = allOrgs.find((o) => o.slug === r.orgSlug);
        if (!org) return { error: `${position}: that organization is no longer available.` };
        name = org.name;
        slug = org.slug;
        type = org.type;
      }

      if (seen.has(slug)) {
        return { error: `${name} is listed twice. Combine those hours into one row.` };
      }
      seen.add(slug);

      const hours = parseFloat(r.hours);
      if (isNaN(hours) || hours <= 0) {
        return { error: `${position}: enter how many hours you did with ${name}.` };
      }

      if (!r.date) return { error: `${position}: pick a date.` };
      if (r.date > localDateStr()) {
        return { error: `${position}: the date cannot be in the future.` };
      }

      resolved.push({ name, slug, type, hours: round2(hours), date: r.date });
    }

    return { resolved };
  };

  const handleContinueFromTotal = () => {
    if (isNaN(total) || total <= 0) {
      setError("Enter how many hours you completed before using GiveTime.");
      return;
    }
    if (total > MAX_TOTAL) {
      setError(`That is over ${MAX_TOTAL.toLocaleString()} hours. Double check the number.`);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleContinueFromSplit = () => {
    const result = resolveRows();
    if ("error" in result) {
      setError(result.error);
      return;
    }
    if (overAssigned) {
      setError(
        `You have assigned ${fmtHours(assigned)} hours but your total is ${fmtHours(
          total
        )}. Lower a row or go back and raise the total.`
      );
      return;
    }
    setError("");
    setStep(3);
  };

  const finalRows = (): ResolvedRow[] => {
    const result = resolveRows();
    if ("error" in result) return [];
    const list = [...result.resolved];
    if (remaining > EPS) {
      // Newest date among the entered rows is the most defensible stamp for the
      // leftover bucket, since those hours happened somewhere in the same span.
      const latest = list.reduce(
        (acc, r) => (r.date > acc ? r.date : acc),
        list[0]?.date ?? localDateStr()
      );
      list.push({
        name: PRIOR_UNSPECIFIED_NAME,
        slug: PRIOR_UNSPECIFIED_SLUG,
        type: PRIOR_UNSPECIFIED_TYPE,
        hours: round2(remaining),
        date: latest,
      });
    }
    return list;
  };

  const handleSubmit = async () => {
    const list = finalRows();
    if (list.length === 0) {
      setError("Something went wrong reading the form. Go back and check your rows.");
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: insertError } = await supabase.from("hour_logs").insert(
      list.map((r) => ({
        user_id: user.id,
        org_name: r.name,
        org_slug: r.slug,
        org_type: r.type,
        date: r.date,
        hours: r.hours,
        notes: "",
        is_prior: true,
      }))
    );

    if (insertError) {
      setSubmitting(false);
      setError(insertError.message);
      return;
    }

    setSubmitting(false);
    hapticSuccess();
    resetAll();
    onSaved();
    onClose();
  };

  const inputStyle = {
    backgroundColor: "var(--bg-filter)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
  };

  const preview = step === 3 ? finalRows() : [];
  const previewTotal = preview.reduce((s, r) => s + r.hours, 0);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md rounded-2xl flex flex-col"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          maxHeight: "85vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-3 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <p
            className="text-xs font-medium mb-1"
            style={{ color: "var(--green-primary)", fontFamily: "'Sora', sans-serif" }}
          >
            Step {step} of 3
          </p>
          <h2
            className="text-xl font-bold pr-8"
            style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
          >
            {step === 1 && "Add past hours"}
            {step === 2 && "Split them up"}
            {step === 3 && "Check it over"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 overflow-y-auto flex-1">
          {/* ── STEP 1 ────────────────────────────────────────── */}
          {step === 1 && (
            <div className="pb-2">
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                If you volunteered before you started using GiveTime, enter the
                total here and you can split it between organizations on the
                next screen.
              </p>

              {existingPriorHours > 0 && (
                <div
                  className="text-sm px-3 py-2.5 rounded-xl mb-4"
                  style={{
                    backgroundColor: "var(--tag-age-bg)",
                    color: "var(--tag-age-text)",
                  }}
                >
                  You have already added {fmtHours(existingPriorHours)} past hours.
                  Anything you add now is on top of that.
                </div>
              )}

              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Total past hours
              </label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                inputMode="decimal"
                placeholder="e.g. 400"
                value={totalInput}
                onChange={(e) => {
                  setTotalInput(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                A rough number is fine. You can delete these entries later if you
                need to redo them.
              </p>
            </div>
          )}

          {/* ── STEP 2 ────────────────────────────────────────── */}
          {step === 2 && (
            <div className="pb-2">
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Add each organization you volunteered with and roughly how many
                of your {fmtHours(total)} hours went to it. Anything left over
                gets grouped as {PRIOR_UNSPECIFIED_NAME.toLowerCase()}.
              </p>

              <div className="space-y-3">
                {rows.map((row, i) => {
                  const isOther = row.orgSlug === OTHER;
                  const available = allOrgs.filter(
                    (o) => o.slug === row.orgSlug || !claimedSlugs.includes(o.slug)
                  );

                  return (
                    <div
                      key={row.key}
                      className="rounded-xl p-3.5"
                      style={{
                        backgroundColor: "var(--bg-filter)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--text-muted)", fontFamily: "'Sora', sans-serif" }}
                        >
                          Organization {i + 1}
                        </span>
                        {rows.length > 1 && (
                          <button
                            onClick={() => removeRow(row.key)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity"
                            style={{ color: "var(--text-muted)" }}
                            aria-label={`Remove organization ${i + 1}`}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <select
                        value={row.orgSlug}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateRow(row.key, {
                            orgSlug: v,
                            ...(v !== OTHER ? { customName: "", customType: "Community" } : {}),
                          });
                        }}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none cursor-pointer mb-2"
                        style={{
                          backgroundColor: "var(--bg-card)",
                          border: "1px solid var(--border-color)",
                          color: "var(--text-primary)",
                        }}
                      >
                        <option value="">Select an organization...</option>
                        {available.map((org) => (
                          <option key={org.slug} value={org.slug}>
                            {org.name}
                          </option>
                        ))}
                        <option value={OTHER}>Other (not listed)</option>
                      </select>

                      {isOther && (
                        <>
                          <input
                            type="text"
                            placeholder="Organization name"
                            value={row.customName}
                            onChange={(e) => updateRow(row.key, { customName: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-2"
                            style={{
                              backgroundColor: "var(--bg-card)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                          />
                          <select
                            value={row.customType}
                            onChange={(e) => updateRow(row.key, { customType: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none cursor-pointer mb-2"
                            style={{
                              backgroundColor: "var(--bg-card)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                          >
                            {ORG_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                            <option value="Other">Other</option>
                          </select>
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label
                            className="block text-xs mb-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Hours
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            min="0.25"
                            inputMode="decimal"
                            placeholder="0"
                            value={row.hours}
                            onChange={(e) => updateRow(row.key, { hours: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                            style={{
                              backgroundColor: "var(--bg-card)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="block text-xs mb-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Completed through
                          </label>
                          <input
                            type="date"
                            value={row.date}
                            max={localDateStr()}
                            onChange={(e) => updateRow(row.key, { date: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                            style={{
                              backgroundColor: "var(--bg-card)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setRows((prev) => [...prev, makeRow()]);
                  setError("");
                }}
                className="w-full mt-3 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-70"
                style={{
                  color: "var(--green-primary)",
                  border: "1px dashed var(--green-primary)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add organization
              </button>
            </div>
          )}

          {/* ── STEP 3 ────────────────────────────────────────── */}
          {step === 3 && (
            <div className="pb-2">
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                {preview.length} {preview.length === 1 ? "entry" : "entries"} will
                be added to your hours.
              </p>

              <div className="space-y-2">
                {preview.map((r) => {
                  const isBucket = r.slug === PRIOR_UNSPECIFIED_SLUG;
                  return (
                    <div
                      key={r.slug}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        backgroundColor: "var(--bg-filter)",
                        border: isBucket
                          ? "1px dashed var(--border-hover)"
                          : "1px solid var(--border-color)",
                      }}
                    >
                      <div className="min-w-0 mr-3">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {r.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {r.type} · through{" "}
                          {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className="text-sm font-semibold shrink-0"
                        style={{ color: "var(--green-primary)", fontFamily: "'Sora', sans-serif" }}
                      >
                        {fmtHours(r.hours)}h
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: "1px solid var(--border-color)" }}
              >
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Total
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--text-primary)", fontFamily: "'Sora', sans-serif" }}
                >
                  {fmtHours(previewTotal)}h
                </span>
              </div>

              <div
                className="text-xs leading-relaxed px-3 py-3 rounded-xl mt-4"
                style={{
                  backgroundColor: "var(--bg-filter)",
                  color: "var(--text-secondary)",
                }}
              >
                These are saved as past hours. They count toward your total, but
                they stay labelled separately from hours you log shift by shift,
                and any report you export will show the two numbers apart. That
                way anyone reading your report can see which hours were tracked
                in GiveTime and which ones you entered from memory.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 pt-3 pb-6 shrink-0"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          {step === 2 && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Assigned {fmtHours(assigned)} of {fmtHours(total)}
              </span>
              <span
                className="text-xs font-semibold"
                style={{
                  color: overAssigned
                    ? "#e05252"
                    : remaining > EPS
                    ? "var(--text-muted)"
                    : "var(--green-primary)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {overAssigned
                  ? `${fmtHours(Math.abs(remaining))} over`
                  : remaining > EPS
                  ? `${fmtHours(remaining)} left over`
                  : "All assigned"}
              </span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg mb-3">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => {
                  setError("");
                  setStep((s) => (s === 3 ? 2 : 1));
                }}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Back
              </button>
            )}

            {step === 1 && (
              <button
                onClick={handleContinueFromTotal}
                disabled={!totalValid}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "var(--green-primary)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Continue
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleContinueFromSplit}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{
                  backgroundColor: "var(--green-primary)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Review
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "var(--green-primary)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {submitting ? "Saving..." : `Add ${fmtHours(previewTotal)} hours`}
              </button>
            )}
          </div>

          {step > 1 && (
            <button
              onClick={resetAll}
              className="w-full mt-2 text-xs hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-muted)" }}
            >
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
