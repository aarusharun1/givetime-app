"use client";

import { useState } from "react";
import { ORG_TYPES, FORMATS, COUNTIES } from "@/data/types";

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (val: string) => void;
  selectedFormat: string;
  onFormatChange: (val: string) => void;
  selectedCounty: string;
  onCountyChange: (val: string) => void;
  age: string;
  onAgeChange: (val: string) => void;
  tracksHoursOnly: boolean;
  onTracksHoursChange: (val: boolean) => void;
  resultCount: number;
  totalCount: number;
  disabled?: boolean;
  onDisabledClick?: () => void;
}

// Approximate county bounding boxes for SE Michigan
const COUNTY_BOUNDS: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
  Oakland: { minLat: 42.44, maxLat: 42.77, minLng: -83.69, maxLng: -83.10 },
  Wayne: { minLat: 42.05, maxLat: 42.45, minLng: -83.55, maxLng: -82.90 },
  Washtenaw: { minLat: 42.06, maxLat: 42.44, minLng: -84.08, maxLng: -83.54 },
};

function getCountyFromCoords(lat: number, lng: number): string | null {
  for (const [county, bounds] of Object.entries(COUNTY_BOUNDS)) {
    if (lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng) {
      return county;
    }
  }
  return null;
}

export default function FilterBar({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedFormat,
  onFormatChange,
  selectedCounty,
  onCountyChange,
  age,
  onAgeChange,
  tracksHoursOnly,
  onTracksHoursChange,
  resultCount,
  totalCount,
  disabled,
  onDisabledClick,
}: FilterBarProps) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const hasActiveFilters =
    search || selectedType !== "All" || selectedFormat !== "All" || selectedCounty !== "All" || age || tracksHoursOnly;

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const county = getCountyFromCoords(position.coords.latitude, position.coords.longitude);
        if (county) {
          onCountyChange(county);
        } else {
          setLocationError("Could not match your location to a county in our database.");
        }
        setLocating(false);
      },
      () => {
        setLocationError("Could not get your location. Check your browser permissions.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div
      className="sticky top-16 z-40 pb-4 pt-5"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {disabled && (
          <div
            className="absolute inset-0 z-10 cursor-pointer rounded-lg"
            onClick={onDisabledClick}
            aria-label="Sign in to use filters"
          />
        )}
        {/* Search and quick filters row */}
        <div
          className="flex flex-col sm:flex-row gap-3 mb-4"
          style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
        >
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm font-inter transition-colors"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Age input */}
          <div className="flex items-center gap-2 shrink-0">
            <label
              className="text-sm font-inter whitespace-nowrap"
              style={{ color: "var(--text-secondary)" }}
            >
              My age:
            </label>
            <input
              type="number"
              placeholder="--"
              value={age}
              onChange={(e) => onAgeChange(e.target.value)}
              min="5"
              max="99"
              className="w-16 px-3 py-2.5 rounded-lg text-sm font-inter text-center transition-colors"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Format dropdown */}
          <select
            value={selectedFormat}
            onChange={(e) => onFormatChange(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm font-inter cursor-pointer transition-colors shrink-0"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f === "All" ? "All formats" : f}
              </option>
            ))}
          </select>

          {/* County dropdown + Near Me */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedCounty}
              onChange={(e) => onCountyChange(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm font-inter cursor-pointer transition-colors"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              {COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All counties" : c}
                </option>
              ))}
            </select>
            <button
              onClick={handleNearMe}
              disabled={locating}
              title="Find organizations near me"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-inter transition-colors shrink-0"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {locating ? "..." : "Near me"}
            </button>
          </div>
        </div>

        {/* Location error */}
        {locationError && (
          <p className="text-xs mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            {locationError}
          </p>
        )}

        {/* Type pills + tracks hours toggle row */}
        <div
          className="flex items-center gap-2"
          style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
        >
          <div className="flex gap-2 overflow-x-auto filter-scroll pb-1 flex-1">
            <button
              onClick={() => onTypeChange("All")}
              className="px-4 py-1.5 rounded-full text-sm font-inter whitespace-nowrap transition-all duration-200 shrink-0"
              style={{
                backgroundColor:
                  selectedType === "All"
                    ? "var(--green-primary)"
                    : "var(--bg-card)",
                color: selectedType === "All" ? "#fff" : "var(--text-secondary)",
                border:
                  selectedType === "All"
                    ? "1px solid var(--green-primary)"
                    : "1px solid var(--border-color)",
              }}
            >
              All
            </button>
            {ORG_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className="px-4 py-1.5 rounded-full text-sm font-inter whitespace-nowrap transition-all duration-200 shrink-0"
                style={{
                  backgroundColor:
                    selectedType === type
                      ? "var(--green-primary)"
                      : "var(--bg-card)",
                  color:
                    selectedType === type ? "#fff" : "var(--text-secondary)",
                  border:
                    selectedType === type
                      ? "1px solid var(--green-primary)"
                      : "1px solid var(--border-color)",
                }}
              >
                {type}
              </button>
            ))}

            {/* Tracks hours toggle pill */}
            <button
              onClick={() => onTracksHoursChange(!tracksHoursOnly)}
              className="px-4 py-1.5 rounded-full text-sm font-inter whitespace-nowrap transition-all duration-200 shrink-0 flex items-center gap-1.5"
              style={{
                backgroundColor: tracksHoursOnly
                  ? "var(--tag-age-bg)"
                  : "var(--bg-card)",
                color: tracksHoursOnly
                  ? "var(--tag-age-text)"
                  : "var(--text-secondary)",
                border: tracksHoursOnly
                  ? "1px solid var(--tag-age-text)"
                  : "1px solid var(--border-color)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Tracks hours
            </button>
          </div>

          {/* Result count + clear */}
          <div className="flex items-center gap-3 shrink-0 pl-2">
            <span
              className="text-sm font-inter"
              style={{ color: "var(--text-muted)" }}
            >
              {resultCount} of {totalCount}
            </span>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onSearchChange("");
                  onTypeChange("All");
                  onFormatChange("All");
                  onCountyChange("All");
                  onAgeChange("");
                  onTracksHoursChange(false);
                }}
                className="text-xs font-inter px-2 py-1 rounded transition-colors"
                style={{
                  color: "var(--green-text)",
                }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
