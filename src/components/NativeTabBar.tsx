"use client";

import { useTheme } from "./ThemeProvider";
import { hapticLight } from "@/lib/haptics";

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
        // Lowered: sits closer to the home indicator, Blokkd style.
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4px)",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      <nav
        className="w-full max-w-md flex items-center justify-around pointer-events-auto"
        style={{
          position: "relative",
          // Thinner tint than before so more of the page shows through and
          // the blur does the work. Heavy tint is what makes CSS glass read
          // as "frosted plastic" rather than glass.
          backgroundColor: isDark
            ? "rgba(30, 30, 32, 0.45)"
            : "rgba(250, 250, 252, 0.38)",
          backdropFilter: "blur(28px) saturate(220%) brightness(1.06)",
          WebkitBackdropFilter: "blur(28px) saturate(220%) brightness(1.06)",
          borderRadius: "26px",
          padding: "5px",
          border: isDark
            ? "0.5px solid rgba(255, 255, 255, 0.10)"
            : "0.5px solid rgba(255, 255, 255, 0.65)",
          // Outer shadow lifts it off the content; the two inset lines give
          // the rim its thickness, which is most of the glass illusion.
          boxShadow: isDark
            ? "0 8px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.10), inset 0 -1px 0 rgba(255, 255, 255, 0.04)"
            : "0 8px 32px rgba(0, 0, 0, 0.10), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(255, 255, 255, 0.45)",
          overflow: "hidden",
          isolation: "isolate",
        }}
      >
        {/* Top specular sweep: brightest in the middle, fading at the corners */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "6%",
            right: "6%",
            height: "1.5px",
            borderRadius: "1px",
            background: isDark
              ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), rgba(255,255,255,0.10), transparent)"
              : "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), rgba(255,255,255,0.55), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Vertical sheen: light catches the upper half of the pill */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "26px",
            background: isDark
              ? "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.015) 45%, rgba(255,255,255,0) 60%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0) 60%)",
            pointerEvents: "none",
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                hapticLight();
              }}
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
                    ? "rgba(255, 255, 255, 0.09)"
                    : "rgba(255, 255, 255, 0.72)"
                  : "transparent",
                // The active bubble gets its own rim light plus a faint green
                // spill, so it reads as a lit piece of glass rather than a
                // flat highlighted rectangle.
                boxShadow: isActive
                  ? isDark
                    ? "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.22), 0 0 14px rgba(76,175,80,0.10)"
                    : "inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(255,255,255,0.6), 0 2px 8px rgba(0,0,0,0.08), 0 0 14px rgba(46,125,50,0.08)"
                  : "none",
                transition: "all 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
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
