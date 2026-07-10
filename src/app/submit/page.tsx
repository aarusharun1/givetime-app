"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { ORG_TYPES, COUNTIES } from "@/data/types";

const FORMATS = ["In Person", "Online", "In Person + Online"] as const;

export default function SubmitPage() {
  const { user, profile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [format, setFormat] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [county, setCounty] = useState<string>("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [hourCommitment, setHourCommitment] = useState("");
  const [minAge, setMinAge] = useState("");
  const [parentRequired, setParentRequired] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!name.trim() || !website.trim() || !format || !type || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    const ageNum = minAge ? parseInt(minAge) : 0;
    let minAgeDisplay = "";
    if (ageNum > 0) {
      minAgeDisplay = `${ageNum}+`;
    }

    const { error: insertError } = await supabase
      .from("pending_organizations")
      .insert({
        name: name.trim(),
        website: website.trim(),
        format,
        type,
        county: county || "Multiple",
        location: location.trim() || county || "Multiple",
        description: description.trim(),
        hour_commitment: hourCommitment || "",
        min_age: ageNum,
        min_age_display: minAgeDisplay,
        parent_required: parentRequired || "",
        submitter_id: user.id,
        submitter_email: contactEmail.trim() || user.email || "",
      });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSubmitted(true);
  };

  const resetForm = () => {
    setName("");
    setWebsite("");
    setFormat("");
    setType("");
    setCounty("");
    setLocation("");
    setDescription("");
    setHourCommitment("");
    setMinAge("");
    setParentRequired("");
    setContactEmail("");
    setSubmitted(false);
    setError("");
  };

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-inter mb-6 transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to browse
        </a>

        <h1
          className="text-2xl mb-2"
          style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "var(--text-primary)" }}
        >
          Submit an organization
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Know a volunteer organization that should be on GiveTime? Submit it
          here and we will review it for inclusion in our database.
        </p>

        {!user ? (
          /* Not signed in */
          <div
            className="text-center py-12 rounded-2xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--green-light)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2
              className="text-lg font-bold mb-2"
              style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
            >
              Sign in to submit
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              You need an account to submit an organization for review.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                backgroundColor: "var(--green-primary)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Sign in
            </button>
          </div>
        ) : submitted ? (
          /* Success state */
          <div
            className="text-center py-12 rounded-2xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--green-light)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2
              className="text-lg font-bold mb-2"
              style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
            >
              Submission received
            </h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
              Thanks for submitting an organization. We will review it and add it
              to GiveTime if it meets our criteria.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{
                  backgroundColor: "var(--green-primary)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Submit another
              </button>
              <a
                href="/"
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                Back to browse
              </a>
            </div>
          </div>
        ) : (
          /* Form */
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Org name */}
              <Field label="Organization name" required>
                <input
                  type="text"
                  placeholder="e.g. Habitat for Humanity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-filter)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  required
                />
              </Field>

              {/* Website */}
              <Field label="Website" required>
                <input
                  type="url"
                  placeholder="https://example.org"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-filter)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  required
                />
              </Field>

              {/* Format + Type row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Format" required>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--bg-filter)",
                      border: "1px solid var(--border-color)",
                      color: format ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                    required
                  >
                    <option value="">Select format...</option>
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Category" required>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--bg-filter)",
                      border: "1px solid var(--border-color)",
                      color: type ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                    required
                  >
                    <option value="">Select category...</option>
                    {ORG_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>

              {/* County + Location row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="County">
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--bg-filter)",
                      border: "1px solid var(--border-color)",
                      color: county ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    <option value="">Select county...</option>
                    {COUNTIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Location">
                  <input
                    type="text"
                    placeholder="e.g. Novi, MI"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-filter)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </Field>
              </div>

              {/* Description */}
              <Field label="Description" required>
                <textarea
                  placeholder="Briefly describe what volunteers do at this organization"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    backgroundColor: "var(--bg-filter)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  required
                />
              </Field>

              {/* Hour commitment + Min age row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Hour commitment">
                  <input
                    type="text"
                    placeholder="e.g. Low, Medium, High"
                    value={hourCommitment}
                    onChange={(e) => setHourCommitment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-filter)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </Field>

                <Field label="Minimum age">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    placeholder="e.g. 14 (leave blank if none)"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-filter)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </Field>
              </div>

              {/* Parent required */}
              <Field label="Parent or guardian required?">
                <select
                  value={parentRequired}
                  onChange={(e) => setParentRequired(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{
                    backgroundColor: "var(--bg-filter)",
                    border: "1px solid var(--border-color)",
                    color: parentRequired ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  <option value="">Not sure</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Under 16">Under 16</option>
                  <option value="Under 18">Under 18</option>
                  <option value="Varies">Varies</option>
                </select>
              </Field>

              {/* Contact email */}
              <Field label="Your contact email">
                <input
                  type="email"
                  placeholder={user?.email || "your@email.com"}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-filter)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  In case we need to follow up. Defaults to your account email.
                </p>
              </Field>

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
                {submitting ? "Submitting..." : "Submit for review"}
              </button>
            </form>
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: "var(--green-primary)" }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}
