"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import OrgCard from "@/components/OrgCard";
import MyHours from "@/components/MyHours";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import organizationsData from "@/data/organizations.json";
import { Organization } from "@/data/types";

const PREVIEW_LIMIT = 12;

const allOrgs = organizationsData as Organization[];

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"browse" | "hours">("browse");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [age, setAge] = useState("");

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
          org.countyFilter.toLowerCase().includes(q) ||
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
      if (selectedCounty !== "All" && org.countyFilter !== selectedCounty) return false;
      if (age) {
        const userAge = parseInt(age);
        if (!isNaN(userAge) && org.minAge > 0 && userAge < org.minAge) return false;
      }
      return true;
    });
  }, [search, selectedType, selectedFormat, selectedCounty, age]);

  return (
    <>
      <Header
        activeTab={activeTab}
        onTabChange={user ? setActiveTab : undefined}
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
            resultCount={filtered.length}
            totalCount={allOrgs.length}
            disabled={!user}
            onDisabledClick={() => setShowAuthModal(true)}
          />

          {/* Card grid */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-2">
            {filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(user ? filtered : allOrgs.slice(0, PREVIEW_LIMIT)).map((org) => (
                    <OrgCard key={org.number} org={org} />
                  ))}
                </div>

                {/* Auth gate after preview cards */}
                {!user && allOrgs.length > PREVIEW_LIMIT && (
                  <div className="relative mt-4">
                    {/* Fade overlay on last row */}
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
