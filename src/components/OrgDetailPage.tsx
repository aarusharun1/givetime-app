"use client";

import { Organization } from "@/data/types";
import Header from "./Header";
import Link from "next/link";

export default function OrgDetailPage({ org }: { org: Organization }) {
  const hasImage = Boolean(org.image && org.image.trim());

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-inter mb-6 transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to all organizations
        </Link>

        {/* Org header */}
        <div className="flex items-start gap-4 mb-6">
          {/* Logo */}
          <div
            className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: hasImage ? "#fff" : "var(--green-light)",
              border: "1px solid var(--border-color)",
            }}
          >
            {hasImage ? (
              <img src={org.image} alt="" className="w-12 h-12 object-contain" />
            ) : (
              <span
                className="text-2xl font-sora font-bold"
                style={{ color: "var(--green-primary)" }}
              >
                {org.name.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <h1
              className="font-sora font-bold text-2xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {org.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-inter"
                style={{
                  backgroundColor: "var(--tag-type-bg)",
                  color: "var(--tag-type-text)",
                }}
              >
                {org.type}
              </span>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-inter"
                style={{
                  backgroundColor:
                    org.format === "Online"
                      ? "var(--tag-format-online-bg)"
                      : org.format === "In Person + Online"
                        ? "var(--tag-format-hybrid-bg)"
                        : "var(--tag-format-inperson-bg)",
                  color:
                    org.format === "Online"
                      ? "var(--tag-format-online-text)"
                      : org.format === "In Person + Online"
                        ? "var(--tag-format-hybrid-text)"
                        : "var(--tag-format-inperson-text)",
                }}
              >
                {org.format}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            backgroundColor: "var(--bg-filter)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p
            className="text-base font-inter leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            {org.description}
          </p>
        </div>

        {/* Details */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h2
            className="font-sora font-bold text-base mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label="Location" value={org.location} />
            <DetailItem label="County" value={org.county} />
            <DetailItem label="Hour commitment" value={org.hour_commitment} />
            <DetailItem label="Minimum age" value={org.min_age_display} />
            <DetailItem
              label="Parent required"
              value={org.parent_required || "N/A"}
            />
            <DetailItem
              label="Last verified"
              value={org.last_verified || "Not yet verified"}
            />
            <DetailItem
              label="Tracks service hours"
              value={org.tracks_hours ? "Yes" : "No"}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={org.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-inter font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--green-primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--green-dark)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--green-primary)")
            }
          >
            Volunteer with {org.name}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Disclaimer */}
        <p
          className="text-xs font-inter mt-8 leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          GiveTime is an independent student project and is not affiliated with
          or endorsed by {org.name} or any similarly named websites or services.
          Information is sourced from publicly available materials and may not
          reflect the most current details.
        </p>
      </main>
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-xs font-inter mb-0.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <p
        className="text-sm font-inter"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
