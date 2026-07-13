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
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <nav
        className="w-full max-w-md flex items-center justify-around"
        style={{
          backgroundColor: isDark
            ? "rgba(30, 30, 30, 0.85)"
            : "rgba(220, 220, 220, 0.75)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "28px",
          padding: "6px",
          border: isDark
            ? "1px solid rgba(255, 255, 255, 0.08)"
            : "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: isDark
            ? "0 8px 32px rgba(0, 0, 0, 0.4)"
            : "0 8px 32px rgba(0, 0, 0, 0.12)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 transition-colors duration-200"
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "22px",
                color: isActive
                  ? "var(--green-primary)"
                  : isDark
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(0, 0, 0, 0.4)",
                backgroundColor: isActive
                  ? isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(255, 255, 255, 0.7)"
                  : "transparent",
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
