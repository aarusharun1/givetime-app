"use client";

import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";

export default function ProfileTab() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initials = profile?.display_name
    ? profile.display_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

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
        className="rounded-2xl overflow-hidden"
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
            className="relative w-12 h-7 rounded-full transition-colors"
            style={{
              backgroundColor:
                theme === "dark" ? "var(--green-primary)" : "#D1D5DB",
            }}
            aria-label="Toggle dark mode"
          >
            <span
              className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{
                transform:
                  theme === "dark" ? "translateX(22px)" : "translateX(2px)",
              }}
            />
          </button>
        </div>

        {/* Submit an organization */}
        <a
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
        </a>

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
          onClick={signOut}
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

      {/* Footer */}
      <div className="mt-10 text-center">
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
    </div>
  );
}
