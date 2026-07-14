"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { isNativePlatform } from "@/lib/platform";
import { supabase, HourLog } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

const CHART_COLORS = [
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#9C27B0",
  "#F44336",
  "#00BCD4",
  "#FFC107",
  "#3F51B5",
  "#E91E63",
  "#8BC34A",
];

function getPreviousMonth() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const monthName = prev.toLocaleString("en-US", { month: "long" });
  const year = prev.getFullYear();
  const startDate = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = `${prevEnd.getFullYear()}-${String(prevEnd.getMonth() + 1).padStart(2, "0")}-${String(prevEnd.getDate()).padStart(2, "0")}`;
  return { monthName, year, startDate, endDate };
}

function PieChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const gradientParts = data.map((d) => {
    const start = (cumulative / total) * 100;
    cumulative += d.value;
    const end = (cumulative / total) * 100;
    return `${d.color} ${start}% ${end}%`;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-36 h-36 rounded-full"
        style={{
          background: `conic-gradient(${gradientParts.join(", ")})`,
        }}
      />
      <div className="flex flex-col gap-1.5 w-full">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span
                className="truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {d.label}
              </span>
            </div>
            <span
              className="shrink-0 ml-2"
              style={{ color: "var(--text-muted)" }}
            >
              {d.value.toFixed(1)}h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SummaryPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [logs, setLogs] = useState<HourLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNative, setIsNative] = useState(false);

  const { monthName, year } = getPreviousMonth();

  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);

  useEffect(() => {
    if (!user) return;
    const { startDate, endDate } = getPreviousMonth();

    const fetchLogs = async () => {
      const { data } = await supabase
        .from("hour_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      setLogs(data ?? []);
      setLoading(false);
    };

    fetchLogs();
  }, [user]);

  const stats = useMemo(() => {
    const totalHours = logs.reduce((sum, l) => sum + l.hours, 0);
    const entries = logs.length;
    const orgs = new Set(logs.map((l) => l.org_name)).size;
    const categories = new Set(logs.map((l) => l.org_type)).size;

    const byCategory: Record<string, number> = {};
    const byOrg: Record<string, number> = {};
    for (const log of logs) {
      byCategory[log.org_type] = (byCategory[log.org_type] ?? 0) + log.hours;
      byOrg[log.org_name] = (byOrg[log.org_name] ?? 0) + log.hours;
    }

    const categoryData = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label,
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));

    const orgData = Object.entries(byOrg)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value], i) => ({
        label,
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));

    return { totalHours, entries, orgs, categories, categoryData, orgData };
  }, [logs]);

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Sign in to view your summary.
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Header */}
      {isNative ? (
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
            <Link
              href="/"
              className="absolute left-4 flex items-center gap-1 text-sm"
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
          </div>
        </header>
      ) : (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium mb-4"
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
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{
            fontFamily: "'Sora', sans-serif",
            color: "var(--text-primary)",
          }}
        >
          {monthName} {year}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Your volunteer summary for the month
        </p>

        {logs.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No volunteer hours logged in {monthName}.
            </p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Total hours", value: stats.totalHours.toFixed(1) },
                { label: "Entries", value: stats.entries.toString() },
                { label: "Organizations", value: stats.orgs.toString() },
                { label: "Categories", value: stats.categories.toString() },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      color: "var(--text-primary)",
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Pie charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.categoryData.length > 0 && (
                <div
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <h3
                    className="text-sm font-bold mb-4"
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      color: "var(--text-primary)",
                    }}
                  >
                    Hours by category
                  </h3>
                  <PieChart data={stats.categoryData} />
                </div>
              )}

              {stats.orgData.length > 0 && (
                <div
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <h3
                    className="text-sm font-bold mb-4"
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      color: "var(--text-primary)",
                    }}
                  >
                    Hours by organization
                  </h3>
                  <PieChart data={stats.orgData} />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
