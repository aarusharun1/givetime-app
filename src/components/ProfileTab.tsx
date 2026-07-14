"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";

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

export default function ProfileTab() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const initials = profile?.display_name
    ? profile.display_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleSignOut = () => {
    signOut();
    setShowSignOutConfirm(false);
  };

  return (
    <div className="px-5 py-6">
      {/* User info */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ backgroundColor: "var(--green-primary)" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h2
            className="text-lg font-bold truncate"
            style={{
              fontFamily: "'Sora', sans-serif",
              color: "var(--text-primary)",
            }}
          >
            {profile?.display_name}
          </h2>
          <p
            className="text-sm truncate"
            style={{ color: "var(--text-muted)" }}
          >
            {user?.email}
          </p>
        </div>
      </div>

      {/* Settings */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        {/* Dark mode */}
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Dark mode
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-[50px] h-[30px] rounded-full transition-colors"
            style={{
              backgroundColor:
                theme === "dark" ? "var(--green-primary)" : "#D1D5DB",
            }}
            aria-label="Toggle dark mode"
          >
            <span
              className="absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{
                transform:
                  theme === "dark" ? "translateX(20px)" : "translateX(0px)",
              }}
            />
          </button>
        </div>

        {/* Submit an organization */}
        <Link
          href="/submit"
          className="flex items-center justify-between px-4 py-3.5"
          style={{
            borderBottom: "1px solid var(--border-color)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="text-sm font-medium">Submit an organization</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>

        {/* Our website */}
        <a
          href="https://givetime.co"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-4 py-3.5"
          style={{
            borderBottom: "1px solid var(--border-color)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-sm font-medium">Our website</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>

        {/* Sign out */}
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="text-sm font-medium" style={{ color: "#EF4444" }}>
            Sign out
          </span>
        </button>
      </div>

      {/* Info section: what the tags mean */}
      <div className="mb-6">
        <h3
          className="text-sm font-bold mb-3"
          style={{
            fontFamily: "'Sora', sans-serif",
            color: "var(--text-primary)",
          }}
        >
          Understanding the tags
        </h3>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          {/* Category */}
          <div
            className="px-4 py-3.5"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="mb-1.5">
              <Tag
                label="Community"
                bg="var(--tag-type-bg)"
                text="var(--tag-type-text)"
              />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The category tag describes the type of cause or work the
              organization focuses on, such as community service, tutoring,
              health, environment, and more.
            </p>
          </div>

          {/* Format */}
          <div
            className="px-4 py-3.5"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="flex gap-1.5 mb-1.5">
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
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The format tag tells you whether the volunteer opportunity is
              done in person at a physical location, done remotely online,
              or a mix of both. This helps you find options that fit your
              schedule and preferences.
            </p>
          </div>

          {/* Location / County */}
          <div
            className="px-4 py-3.5"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="mb-1.5">
              <Tag
                label="Oakland"
                bg="var(--tag-county-bg)"
                text="var(--tag-county-text)"
              />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The location tag shows which county in Southeast Michigan the
              organization operates in. Organizations that serve multiple
              areas or are available online are tagged accordingly.
            </p>
          </div>

          {/* Tracks Hours */}
          <div
            className="px-4 py-3.5"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="mb-1.5">
              <Tag
                label="Tracks hours"
                bg="var(--tag-tracks-bg)"
                text="var(--tag-tracks-text)"
              />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              This tag means the organization specifically mentions that they
              track and certify volunteer hours. They may provide verification
              letters, digital hour logs, or signed forms that you can use for
              school requirements, college applications, or service awards.
            </p>
          </div>

          {/* Age */}
          <div className="px-4 py-3.5">
            <div className="mb-1.5">
              <Tag
                label="15+"
                bg="var(--tag-age-bg)"
                text="var(--tag-age-text)"
              />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The age tag shows any minimum age requirement that the
              organization sets for its volunteers. If no age tag is shown,
              the organization either accepts all ages or does not specify
              a minimum on their website.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          GiveTime is an independent student project and is not affiliated with
          or endorsed by any similarly named websites or services.
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          &copy; 2024-2026 GiveTime by Aarush Arun
        </p>
      </div>

      {/* Sign out confirmation modal */}
      {showSignOutConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          onClick={() => setShowSignOutConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs rounded-2xl p-6 text-center"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-bold mb-2"
              style={{
                fontFamily: "'Sora', sans-serif",
                color: "var(--text-primary)",
              }}
            >
              Sign out?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Are you sure you want to sign out of GiveTime?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#EF4444" }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
