"use client";

import { useTheme } from "./ThemeProvider";

interface NativeTabBarProps {
  activeTab: "browse" | "hours" | "profile";
  onTabChange: (tab: "browse" | "hours" | "profile") => void;
}

export default function NativeTabBar({
  activeTab,
  onTabChange,
}: NativeTabBarProps) {
  const { theme } = useTheme();

  const tabs = [
    {
      id: "browse" as const,
      label: "Browse",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      id: "hours" as const,
      label: "My Hours",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "profile" as const,
      label: "Profile",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const isDark = theme === "dark";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      <nav
        className="w-full max-w-md flex items-center justify-around pointer-events-auto"
        style={{
          position: "relative",
          backgroundColor: isDark
            ? "rgba(38, 38, 40, 0.55)"
            : "rgba(245, 245, 247, 0.45)",
          backdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          borderRadius: "26px",
          padding: "5px",
          border: isDark
            ? "0.5px solid rgba(255, 255, 255, 0.12)"
            : "0.5px solid rgba(255, 255, 255, 0.6)",
          boxShadow: isDark
            ? "0 4px 24px rgba(0, 0, 0, 0.35), inset 0 0.5px 0 rgba(255, 255, 255, 0.06)"
            : "0 4px 24px rgba(0, 0, 0, 0.08), inset 0 0.5px 0 rgba(255, 255, 255, 0.8)",
          overflow: "hidden",
        }}
      >
        {/* Specular highlight at top edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background: isDark
              ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)"
              : "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
            pointerEvents: "none",
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5"
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "22px",
                color: isActive
                  ? "var(--green-primary)"
                  : isDark
                  ? "rgba(255, 255, 255, 0.45)"
                  : "rgba(0, 0, 0, 0.35)",
                backgroundColor: isActive
                  ? isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.55)"
                  : "transparent",
                boxShadow: isActive
                  ? isDark
                    ? "inset 0 0.5px 0 rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.15)"
                    : "inset 0 0.5px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06)"
                  : "none",
                transition: "all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
            >
              {tab.icon}
              <span
                className="font-medium"
                style={{
                  fontSize: "10px",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
