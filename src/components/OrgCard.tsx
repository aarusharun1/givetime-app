"use client";

import { Organization } from "@/data/types";
import { useState, useEffect } from "react";
import Link from "next/link";

interface OrgCardProps {
  org: Organization;
}

// Format badge colors - use CSS variables for dark mode support
function getFormatStyle(format: string) {
  if (format === "Online") {
    return { bg: "var(--tag-format-online-bg)", text: "var(--tag-format-online-text)" };
  }
  if (format === "In Person + Online") {
    return { bg: "var(--tag-format-hybrid-bg)", text: "var(--tag-format-hybrid-text)" };
  }
  return { bg: "var(--tag-format-inperson-bg)", text: "var(--tag-format-inperson-text)" };
}

export default function OrgCard({ org }: OrgCardProps) {
  const [open, setOpen] = useState(false);
  const hasImage = org.image && org.image.startsWith("http");
  const formatStyle = getFormatStyle(org.format);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Card */}
      <div
        className="rounded-xl transition-all duration-300 cursor-pointer"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-card)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
          e.currentTarget.style.borderColor = "var(--border-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-card)";
          e.currentTarget.style.borderColor = "var(--border-color)";
        }}
        onClick={() => setOpen(true)}
      >
        <div className="p-5">
          {/* Top row: logo + name */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: hasImage ? "#fff" : "var(--green-light)",
                border: hasImage ? "1px solid var(--border-color)" : "none",
              }}
            >
              {hasImage ? (
                <img src={org.image} alt="" className="w-9 h-9 object-contain" loading="lazy" />
              ) : (
                <span
                  className="text-lg"
                  style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "var(--green-primary)" }}
                >
                  {org.name.charAt(0)}
                </span>
              )}
            </div>
            <h3
              className="text-base leading-snug"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {org.name}
            </h3>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {/* Type - neutral gray */}
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-inter font-medium"
              style={{
                backgroundColor: "var(--tag-type-bg)",
                color: "var(--tag-type-text)",
              }}
            >
              {org.type}
            </span>

            {/* Format - colored */}
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-inter font-medium"
              style={{
                backgroundColor: formatStyle.bg,
                color: formatStyle.text,
              }}
            >
              {org.format}
            </span>

            {/* Age - amber */}
            {org.minAge > 0 && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-inter font-medium"
                style={{
                  backgroundColor: "var(--tag-age-bg)",
                  color: "var(--tag-age-text)",
                }}
              >
                {org.minAgeDisplay}
              </span>
            )}

            {/* County - purple */}
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-inter font-medium"
              style={{
                backgroundColor: "var(--tag-county-bg)",
                color: "var(--tag-county-text)",
              }}
            >
              {org.county}
            </span>
          </div>
        </div>
      </div>

      {/* Modal popup */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors z-10"
              style={{ backgroundColor: "var(--bg-filter)" }}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5 pr-8">
                <div
                  className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: hasImage ? "#fff" : "var(--green-light)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  {hasImage ? (
                    <img src={org.image} alt="" className="w-10 h-10 object-contain" />
                  ) : (
                    <span
                      className="text-xl"
                      style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "var(--green-primary)" }}
                    >
                      {org.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h2
                    className="text-xl mb-2"
                    style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "var(--text-primary)" }}
                  >
                    {org.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium"
                      style={{ backgroundColor: "var(--tag-type-bg)", color: "var(--tag-type-text)" }}
                    >
                      {org.type}
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium"
                      style={{ backgroundColor: formatStyle.bg, color: formatStyle.text }}
                    >
                      {org.format}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p
                className="text-sm font-inter leading-relaxed mb-5"
                style={{ color: "var(--text-secondary)" }}
              >
                {org.description}
              </p>

              {/* Details */}
              <div
                className="rounded-xl p-4 mb-5"
                style={{ backgroundColor: "var(--bg-filter)", border: "1px solid var(--border-color)" }}
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-inter">
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Location</p>
                    <p style={{ color: "var(--text-primary)" }}>{org.location}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>County</p>
                    <p style={{ color: "var(--text-primary)" }}>{org.county}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Hour commitment</p>
                    <p style={{ color: "var(--text-primary)" }}>{org.hourCommitment}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Minimum age</p>
                    <p style={{ color: "var(--text-primary)" }}>{org.minAgeDisplay}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Parent required</p>
                    <p style={{ color: "var(--text-primary)" }}>{org.parentRequired || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={org.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-inter font-medium text-white transition-colors flex-1"
                  style={{ backgroundColor: "var(--green-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--green-dark)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--green-primary)")}
                >
                  Volunteer
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <Link
                  href={`/org/${org.slug}`}
                  className="inline-flex items-center justify-center gap-1 px-5 py-2.5 rounded-xl text-sm font-inter transition-colors"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
                >
                  Full page
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
