"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import OrgCard from "@/components/OrgCard";
import MyHours from "@/components/MyHours";
import AuthModal from "@/components/AuthModal";
import NativeWelcome from "@/components/NativeWelcome";
import NativeTabBar from "@/components/NativeTabBar";
import ProfileTab from "@/components/ProfileTab";
import MonthlySummaryBanner from "@/components/MonthlySummaryBanner";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useOrganizations } from "@/lib/useOrganizations";
import { isNativePlatform } from "@/lib/platform";
import { setupNotifications, scheduleInactivityNudge } from "@/lib/notifications";

const PREVIEW_LIMIT = 12;

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { organizations: allOrgs, loading: orgsLoading } = useOrganizations();
  const [activeTab, setActiveTab] = useState<"browse" | "hours" | "profile">("browse");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [age, setAge] = useState("");
  const [tracksHoursOnly, setTracksHoursOnly] = useState(false);

  // Detect native platform after hydration
  const [isNative, setIsNative] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);

  // Reset guest mode when user signs in
  useEffect(() => {
    if (user) setGuestMode(false);
  }, [user]);

  // Set up notifications when native user signs in
  useEffect(() => {
    if (isNative && user) {
      setupNotifications();
    }
  }, [isNative, user]);

  // Reschedule inactivity nudge every time the app opens
  useEffect(() => {
    if (isNative && user) {
      scheduleInactivityNudge();
    }
  }, [isNative, user]);

  const filtered = useMemo(() => {
    return allOrgs.filter((org) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          org.name.toLowerCase().includes(q) ||
          org.description.toLowerCase().includes(q) ||
          org.type.toLowerCase().includes(q) ||
          org.location.toLowerCase().includes(q) ||
          org.county.toLowerCase().includes(q) ||
          org.format.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (selectedType !== "All" && org.type !== selectedType) return false;
      if (selectedFormat !== "All") {
        if (selectedFormat === "In Person") {
          if (!org.format.includes("In Person")) return false;
        } else if (selectedFormat === "Online") {
          if (!org.format.includes("Online")) return false;
        } else if (org.format !== selectedFormat) {
          return false;
        }
      }
      if (selectedCounty !== "All" && org.county !== selectedCounty) return false;
      if (age) {
        const userAge = parseInt(age);
        if (!isNaN(userAge) && org.min_age > 0 && userAge < org.min_age) return false;
      }
      if (tracksHoursOnly && !org.tracks_hours) return false;
      return true;
    });
  }, [allOrgs, search, selectedType, selectedFormat, selectedCounty, age, tracksHoursOnly]);

  // Shared org grid content (used by both web and native browse)
  const orgGrid = (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-2">
      {orgsLoading ? (
        <div className="text-center py-16">
          <p
            className="font-inter text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Loading organizations...
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((org) => (
            <OrgCard
              key={org.slug}
              org={org}
              onAuthRequired={() => {
                if (isNative && !user) {
                  setGuestMode(false);
                  setActiveTab("browse");
                } else {
                  setShowAuthModal(true);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-filter)" }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2
            className="font-sora font-bold text-lg mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            No organizations found
          </h2>
          <p
            className="font-inter text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </main>
  );

  // ─── NATIVE APP LAYOUT ───────────────────────────────────
  if (isNative) {
    // Show welcome screen when not signed in and not in guest mode
    if (!user && !authLoading && !guestMode) {
      return <NativeWelcome onContinueAsGuest={() => setGuestMode(true)} />;
    }

    // Loading state
    if (authLoading) {
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <Image
            src={
              theme === "dark"
                ? "/images/logo-nav-dark.png"
                : "/images/logo-nav-light.png"
            }
            alt="GiveTime"
            width={120}
            height={36}
            priority
            unoptimized
          />
        </div>
      );
    }

    // Auth prompt shown when guest taps My Hours or Profile
    const nativeAuthPrompt = (
      <div className="flex flex-col items-center justify-center px-8 py-20">
        <div
          className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--green-light)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2
          className="text-lg font-bold mb-2 text-center"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
        >
          Sign in to access {activeTab === "hours" ? "My Hours" : "your profile"}
        </h2>
        <p
          className="text-sm mb-6 text-center max-w-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          {activeTab === "hours"
            ? "Create a free account to log your volunteer hours, view analytics, and export reports."
            : "Create a free account to manage your profile, submit organizations, and view your monthly summary."}
        </p>
        <button
          onClick={() => {
            setGuestMode(false);
            setActiveTab("browse");
          }}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{
            backgroundColor: "var(--green-primary)",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Sign in
        </button>
      </div>
    );

    // Native layout (signed in or guest)
    return (
      <>
        {/* Minimal native header */}
        <header
          className="sticky top-0 z-50 backdrop-blur-md safe-top"
          style={{
            backgroundColor:
              theme === "dark"
                ? "rgba(18, 18, 18, 0.9)"
                : "rgba(253, 252, 250, 0.9)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div className="h-12 flex items-center justify-center relative">
            <Image
              src={
                theme === "dark"
                  ? "/images/logo-nav-dark.png"
                  : "/images/logo-nav-light.png"
              }
              alt="GiveTime"
              width={110}
              height={32}
              className="h-6 w-auto"
              priority
              unoptimized
            />
            {/* Sign in button for guests */}
            {!user && (
              <button
                onClick={() => {
                  setGuestMode(false);
                  setActiveTab("browse");
                }}
                className="absolute right-4 px-3 py-1 rounded-lg text-xs font-semibold text-white"
                style={{
                  backgroundColor: "var(--green-primary)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </header>

        {/* Content area with bottom padding for tab bar */}
        {/* Tab bar is about 63px tall and now sits 4px off the safe area,
            so content needs to clear roughly 76px plus the inset. The old
            56px let the last row of cards slide under the bar. */}
        <div style={{ paddingBottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}>
          {activeTab === "browse" && (
            <>
              {user && <MonthlySummaryBanner />}
              <FilterBar
                search={search}
                onSearchChange={setSearch}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
                selectedCounty={selectedCounty}
                onCountyChange={setSelectedCounty}
                age={age}
                onAgeChange={setAge}
                tracksHoursOnly={tracksHoursOnly}
                onTracksHoursChange={setTracksHoursOnly}
                resultCount={filtered.length}
                totalCount={allOrgs.length}
                collapsible
              />
              {orgGrid}
            </>
          )}

          {activeTab === "hours" && (
            user ? (
              <section
                className="py-6"
                style={{ backgroundColor: "var(--bg-primary)" }}
              >
                <MyHours />
              </section>
            ) : (
              nativeAuthPrompt
            )
          )}

          {activeTab === "profile" && (
            user ? <ProfileTab /> : nativeAuthPrompt
          )}
        </div>

        <NativeTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  // ─── WEB LAYOUT (unchanged) ──────────────────────────────
  return (
    <>
      <Header
        activeTab={activeTab === "profile" ? "browse" : activeTab}
        onTabChange={user ? (tab) => setActiveTab(tab) : undefined}
      />

      {activeTab === "browse" || !user ? (
        <>
          {/* Hero section */}
          <section
            className="py-10 sm:py-14"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1
                className="mb-3"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  fontSize: "clamp(1.875rem, 5vw, 3rem)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                Find the right place to{" "}
                <br className="hidden sm:block" />
                <span style={{ color: "var(--green-primary)" }}>give back</span>
              </h1>
              <p
                className="font-inter text-base sm:text-lg max-w-xl mx-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                Browse 100+ volunteer organizations across Southeast Michigan
              </p>
            </div>
          </section>

          {/* Filters */}
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
            selectedCounty={selectedCounty}
            onCountyChange={setSelectedCounty}
            age={age}
            onAgeChange={setAge}
            tracksHoursOnly={tracksHoursOnly}
            onTracksHoursChange={setTracksHoursOnly}
            resultCount={filtered.length}
            totalCount={allOrgs.length}
            disabled={!user}
            onDisabledClick={() => setShowAuthModal(true)}
          />

          {/* Card grid */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-2">
            {orgsLoading ? (
              <div className="text-center py-16">
                <p
                  className="font-inter text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Loading organizations...
                </p>
              </div>
            ) : filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(user ? filtered : allOrgs.slice(0, PREVIEW_LIMIT)).map((org) => (
                    <OrgCard key={org.slug} org={org} />
                  ))}
                </div>

                {/* Auth gate after preview cards */}
                {!user && allOrgs.length > PREVIEW_LIMIT && (
                  <div className="relative mt-4">
                    <div
                      className="absolute -top-24 left-0 right-0 h-24 pointer-events-none"
                      style={{
                        background: `linear-gradient(to bottom, transparent, var(--bg-primary))`,
                      }}
                    />
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
                        Sign in to see all {allOrgs.length} organizations
                      </h2>
                      <p
                        className="text-sm mb-6 max-w-md mx-auto"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Create a free account to browse every organization, log your
                        volunteer hours, and track your community impact.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{
                            backgroundColor: "var(--green-primary)",
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
                          Sign up free
                        </button>
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="px-6 py-2.5 rounded-xl text-sm font-medium"
                          style={{
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-color)",
                          }}
                        >
                          Log in
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-filter)" }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h2
                  className="font-sora font-bold text-lg mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  No organizations found
                </h2>
                <p
                  className="font-inter text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </main>
        </>
      ) : (
        /* My Hours tab */
        <section className="py-8" style={{ backgroundColor: "var(--bg-primary)" }}>
          <MyHours />
        </section>
      )}

      {/* Footer */}
      <footer
        className="py-8"
        style={{
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-inter mb-4">
            <a
              href="/submit"
              className="font-medium transition-colors"
              style={{ color: "var(--green-primary)" }}
            >
              Submit an organization
            </a>
          </p>
          <p
            className="text-xs font-inter leading-relaxed mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            GiveTime is an independent student project and is not affiliated with
            or endorsed by any similarly named websites or services. GiveTime is
            not officially affiliated with the organizations listed.
          </p>
          <p
            className="text-xs font-inter"
            style={{ color: "var(--text-muted)" }}
          >
            &copy; 2024-2026 GiveTime by Aarush Arun. All rights reserved.
          </p>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
