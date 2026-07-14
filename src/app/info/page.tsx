"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useTheme } from "@/components/ThemeProvider";

function Tag({
  label,
  bg,
  text,
}: {
  label: string;
  bg: string;
  text: string;
}) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}

export default function InfoPage() {
  const { theme } = useTheme();

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium mb-6"
          style={{ color: "var(--green-primary)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>

        <h1
          className="text-2xl font-bold mb-2"
          style={{
            fontFamily: "'Sora', sans-serif",
            color: "var(--text-primary)",
          }}
        >
          Understanding the tags
        </h1>
        <p
          className="text-sm mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Each organization in GiveTime has tags that help you quickly
          understand what to expect. Here is what they mean.
        </p>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          {/* Category */}
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="mb-2">
              <Tag
                label="Community"
                bg="var(--tag-type-bg)"
                text="var(--tag-type-text)"
              />
            </div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{
                fontFamily: "'Sora', sans-serif",
                color: "var(--text-primary)",
              }}
            >
              Category
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              The category tag describes the type of cause or work the
              organization focuses on, such as community service, tutoring,
              health, environment, and more.
            </p>
          </div>

          {/* Format */}
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="flex gap-1.5 mb-2">
              <Tag
                label="In Person"
                bg="var(--tag-format-inperson-bg)"
                text="var(--tag-format-inperson-text)"
              />
              <Tag
                label="Online"
                bg="var(--tag-format-online-bg)"
                text="var(--tag-format-online-text)"
              />
            </div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{
                fontFamily: "'Sora', sans-serif",
                color: "var(--text-primary)",
              }}
            >
              Format
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              The format tag tells you whether the volunteer opportunity is
              done in person at a physical location, done remotely online,
              or a mix of both. This helps you find options that fit your
              schedule and preferences.
            </p>
          </div>

          {/* Location / County */}
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="mb-2">
              <Tag
                label="Oakland"
                bg="var(--tag-county-bg)"
                text="var(--tag-county-text)"
              />
            </div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{
                fontFamily: "'Sora', sans-serif",
                color: "var(--text-primary)",
              }}
            >
              Location
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              The location tag shows which county in Southeast Michigan the
              organization operates in. Organizations that serve multiple
              areas or are available online are tagged accordingly.
            </p>
          </div>

          {/* Tracks Hours */}
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="mb-2">
              <Tag
                label="Tracks hours"
                bg="var(--tag-tracks-bg)"
                text="var(--tag-tracks-text)"
              />
            </div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{
                fontFamily: "'Sora', sans-serif",
                color: "var(--text-primary)",
              }}
            >
              Tracks hours
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              This tag means the organization specifically mentions that they
              track and certify volunteer hours. They may provide verification
              letters, digital hour logs, or signed forms that you can use for
              school requirements, college applications, or service awards.
            </p>
          </div>

          {/* Age */}
          <div className="px-5 py-4">
            <div className="mb-2">
              <Tag
                label="15+"
                bg="var(--tag-age-bg)"
                text="var(--tag-age-text)"
              />
            </div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{
                fontFamily: "'Sora', sans-serif",
                color: "var(--text-primary)",
              }}
            >
              Age requirement
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              The age tag shows any minimum age requirement that the
              organization sets for its volunteers. If no age tag is shown,
              the organization either accepts all ages or does not specify
              a minimum on their website.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
