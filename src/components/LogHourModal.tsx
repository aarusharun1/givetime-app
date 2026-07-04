"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import organizationsData from "@/data/organizations.json";
import { Organization, ORG_TYPES } from "@/data/types";

const allOrgs = organizationsData as Organization[];

interface LogHourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogged: () => void;
  preselectedOrg?: { name: string; slug: string; type: string } | null;
}

export default function LogHourModal({
  isOpen,
  onClose,
  onLogged,
  preselectedOrg,
}: LogHourModalProps) {
  const { user } = useAuth();
  const [selectedOrgSlug, setSelectedOrgSlug] = useState(
    preselectedOrg?.slug ?? ""
  );
  const [customOrgName, setCustomOrgName] = useState("");
  const [customOrgType, setCustomOrgType] = useState("Community");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;

  const isOther = selectedOrgSlug === "__other__";
  const selectedOrg = preselectedOrg
    ? preselectedOrg
    : isOther
    ? null
    : allOrgs.find((o) => o.slug === selectedOrgSlug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Determine org info
    let orgName: string;
    let orgSlug: string;
    let orgType: string;

    if (preselectedOrg) {
      orgName = preselectedOrg.name;
      orgSlug = preselectedOrg.slug;
      orgType = preselectedOrg.type;
    } else if (isOther) {
      if (!customOrgName.trim()) {
        setError("Please enter the organization name.");
        return;
      }
      orgName = customOrgName.trim();
      orgSlug = "custom-" + orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
      orgType = customOrgType;
    } else if (selectedOrg) {
      orgName = selectedOrg.name;
      orgSlug = "slug" in selectedOrg ? selectedOrg.slug : selectedOrgSlug;
      orgType = selectedOrg.type;
    } else {
      setError("Please select an organization.");
      return;
    }

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setError("Please enter a valid number of hours.");
      return;
    }
    if (hoursNum > 24) {
      setError("Hours per entry cannot exceed 24.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from("hour_logs").insert({
      user_id: user.id,
      org_name: orgName,
      org_slug: orgSlug,
      org_type: orgType,
      date,
      hours: hoursNum,
      notes: notes.trim(),
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setHours("");
    setNotes("");
    setCustomOrgName("");
    setCustomOrgType("Community");
    setSelectedOrgSlug(preselectedOrg?.slug ?? "");
    setDate(new Date().toISOString().split("T")[0]);
    onLogged();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
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

        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
        >
          Log volunteer hours
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {preselectedOrg
            ? `Recording hours for ${preselectedOrg.name}`
            : "Select an organization and enter your hours."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Org picker (hidden if preselected) */}
          {!preselectedOrg && (
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Organization
              </label>
              <select
                value={selectedOrgSlug}
                onChange={(e) => {
                  setSelectedOrgSlug(e.target.value);
                  if (e.target.value !== "__other__") {
                    setCustomOrgName("");
                    setCustomOrgType("Community");
                  }
                }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                style={{
                  backgroundColor: "var(--bg-filter)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                required
              >
                <option value="">Select an organization...</option>
                {allOrgs.map((org) => (
                  <option key={org.slug} value={org.slug}>
                    {org.name}
                  </option>
                ))}
                <option value="__other__">Other (not listed)</option>
              </select>
            </div>
          )}

          {/* Custom org fields (visible when "Other" is selected) */}
          {isOther && !preselectedOrg && (
            <>
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Organization name
                </label>
                <input
                  type="text"
                  placeholder="Enter the organization name"
                  value={customOrgName}
                  onChange={(e) => setCustomOrgName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-filter)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Category
                </label>
                <select
                  value={customOrgType}
                  onChange={(e) => setCustomOrgType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{
                    backgroundColor: "var(--bg-filter)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  {ORG_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          {/* Date */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-filter)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
              required
            />
          </div>

          {/* Hours */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              Hours
            </label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              placeholder="e.g. 2.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-filter)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              Notes{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <textarea
              placeholder="What did you work on?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{
                backgroundColor: "var(--bg-filter)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--green-primary)",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {submitting ? "Saving..." : "Log hours"}
          </button>
        </form>
      </div>
    </div>
  );
}
