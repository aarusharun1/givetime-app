"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthProvider";
import { supabase, HourLog } from "@/lib/supabase";
import LogHourModal from "./LogHourModal";
import jsPDF from "jspdf";

function exportCSV(logs: HourLog[], displayName: string) {
  const header = "Organization,Category,Date,Hours,Notes";
  const rows = logs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => {
      const date = new Date(l.date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const notes = l.notes ? `"${l.notes.replace(/"/g, '""')}"` : "";
      const orgName = l.org_name.includes(",") ? `"${l.org_name}"` : l.org_name;
      return `${orgName},${l.org_type},${date},${Number(l.hours).toFixed(2)},${notes}`;
    });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const firstName = displayName?.split(" ")[0] ?? "volunteer";
  a.download = `givetime-hours-${firstName.toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(
  logs: HourLog[],
  analytics: {
    totalHours: number;
    totalEntries: number;
    uniqueOrgs: number;
    byType: { type: string; hours: number }[];
    byOrg: { name: string; hours: number }[];
  },
  displayName: string
) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginL = 56;
  const marginR = 56;
  const contentW = pageW - marginL - marginR;
  let y = 56;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(46, 125, 50);
  doc.text("GiveTime", marginL, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Volunteer Hour Report", marginL + doc.getTextWidth("GiveTime  ") + 4, y);
  y += 32;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(marginL, y, pageW - marginR, y);
  y += 24;

  // Name and date range
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(displayName || "Volunteer", marginL, y);
  y += 18;

  const dates = logs.map((l) => l.date).sort();
  if (dates.length > 0) {
    const fmt = (d: string) =>
      new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${fmt(dates[0])} to ${fmt(dates[dates.length - 1])}`, marginL, y);
  }
  y += 32;

  // Summary stats row
  const stats = [
    { label: "Total Hours", value: analytics.totalHours.toFixed(1) },
    { label: "Entries", value: analytics.totalEntries.toString() },
    { label: "Organizations", value: analytics.uniqueOrgs.toString() },
    { label: "Categories", value: analytics.byType.length.toString() },
  ];
  const statW = contentW / stats.length;
  stats.forEach((stat, i) => {
    const x = marginL + i * statW;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(46, 125, 50);
    doc.text(stat.value, x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(stat.label, x, y + 14);
  });
  y += 48;

  // Divider
  doc.line(marginL, y, pageW - marginR, y);
  y += 24;

  // Hours by Category
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text("Hours by Category", marginL, y);
  y += 20;

  analytics.byType.forEach((item) => {
    const pct = analytics.totalHours > 0 ? (item.hours / analytics.totalHours) * 100 : 0;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(item.type, marginL, y);
    doc.setTextColor(100, 100, 100);
    doc.text(`${item.hours.toFixed(1)} hrs (${pct.toFixed(0)}%)`, marginL + contentW - doc.getTextWidth(`${item.hours.toFixed(1)} hrs (${pct.toFixed(0)}%)`), y);

    // Progress bar
    y += 6;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(marginL, y, contentW, 6, 3, 3, "F");
    if (pct > 0) {
      doc.setFillColor(46, 125, 50);
      doc.roundedRect(marginL, y, Math.max((contentW * pct) / 100, 6), 6, 3, 3, "F");
    }
    y += 20;
  });
  y += 8;

  // Top 5 Organizations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text("Top Organizations", marginL, y);
  y += 20;

  analytics.byOrg.slice(0, 5).forEach((item, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`${i + 1}. ${item.name}`, marginL, y);
    doc.setTextColor(100, 100, 100);
    const hoursText = `${item.hours.toFixed(1)} hrs`;
    doc.text(hoursText, marginL + contentW - doc.getTextWidth(hoursText), y);
    y += 18;
  });
  y += 16;

  // Footer divider
  doc.setDrawColor(200, 200, 200);
  doc.line(marginL, y, pageW - marginR, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Generated by GiveTime on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    marginL,
    y
  );
  doc.text("givetime.co", marginL + contentW - doc.getTextWidth("givetime.co"), y);

  const firstName = displayName?.split(" ")[0] ?? "volunteer";
  doc.save(`givetime-report-${firstName.toLowerCase()}.pdf`);
}

export default function MyHours() {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<HourLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("hour_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    setLogs(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDelete = async (id: string) => {
    await supabase.from("hour_logs").delete().eq("id", id);
    setDeleteConfirm(null);
    fetchLogs();
  };

  // Analytics computations
  const analytics = useMemo(() => {
    if (logs.length === 0) {
      return {
        totalHours: 0,
        totalEntries: 0,
        uniqueOrgs: 0,
        byType: [] as { type: string; hours: number; count: number }[],
        byOrg: [] as { name: string; slug: string; hours: number; count: number }[],
        byMonth: [] as { month: string; hours: number }[],
        streak: 0,
      };
    }

    const totalHours = logs.reduce((sum, l) => sum + Number(l.hours), 0);
    const totalEntries = logs.length;
    const orgSlugs = new Set(logs.map((l) => l.org_slug));
    const uniqueOrgs = orgSlugs.size;

    // Hours by type
    const typeMap = new Map<string, { hours: number; count: number }>();
    logs.forEach((l) => {
      const existing = typeMap.get(l.org_type) ?? { hours: 0, count: 0 };
      typeMap.set(l.org_type, {
        hours: existing.hours + Number(l.hours),
        count: existing.count + 1,
      });
    });
    const byType = Array.from(typeMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.hours - a.hours);

    // Hours by org
    const orgMap = new Map<string, { name: string; slug: string; hours: number; count: number }>();
    logs.forEach((l) => {
      const existing = orgMap.get(l.org_slug) ?? {
        name: l.org_name,
        slug: l.org_slug,
        hours: 0,
        count: 0,
      };
      orgMap.set(l.org_slug, {
        ...existing,
        hours: existing.hours + Number(l.hours),
        count: existing.count + 1,
      });
    });
    const byOrg = Array.from(orgMap.values()).sort((a, b) => b.hours - a.hours);

    // Hours by month (last 6 months)
    const monthMap = new Map<string, number>();
    logs.forEach((l) => {
      const d = new Date(l.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + Number(l.hours));
    });
    const byMonth = Array.from(monthMap.entries())
      .map(([month, hours]) => ({ month, hours }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    // Volunteering streak (consecutive weeks with at least one log)
    const weekSet = new Set<string>();
    logs.forEach((l) => {
      const d = new Date(l.date);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(
        ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
      );
      weekSet.add(`${d.getFullYear()}-W${weekNum}`);
    });

    return { totalHours, totalEntries, uniqueOrgs, byType, byOrg, byMonth, streak: weekSet.size };
  }, [logs]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p style={{ color: "var(--text-muted)" }}>Loading your hours...</p>
      </div>
    );
  }

  const firstName = profile?.display_name?.split(" ")[0] ?? "there";

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        {/* Header area */}
        <div className="flex items-center justify-between mb-8 pt-2">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
            >
              Hey, {firstName}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {logs.length === 0
                ? "Log your first volunteer hours to get started."
                : `You've logged ${analytics.totalHours.toFixed(1)} hours across ${analytics.uniqueOrgs} organization${analytics.uniqueOrgs !== 1 ? "s" : ""}.`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {logs.length > 0 && (
              <>
                <button
                  onClick={() => exportCSV(logs, profile?.display_name ?? "")}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                    fontFamily: "'Sora', sans-serif",
                  }}
                  title="Export all entries as CSV"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="hidden sm:inline">CSV</span>
                </button>
                <button
                  onClick={() =>
                    exportPDF(logs, analytics, profile?.display_name ?? "")
                  }
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                    fontFamily: "'Sora', sans-serif",
                  }}
                  title="Export summary report as PDF"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </>
            )}
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{
                backgroundColor: "var(--green-primary)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="hidden sm:inline">Log hours</span>
            </button>
          </div>
        </div>

        {logs.length === 0 ? (
          /* Empty state */
          <div
            className="text-center py-16 rounded-2xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--green-light)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2
              className="font-bold text-lg mb-1"
              style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
            >
              No hours logged yet
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Start tracking your volunteer impact.
            </p>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--green-primary)" }}
            >
              Log your first hours
            </button>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total hours", value: analytics.totalHours.toFixed(1) },
                { label: "Entries", value: analytics.totalEntries.toString() },
                { label: "Organizations", value: analytics.uniqueOrgs.toString() },
                { label: "Categories", value: analytics.byType.length.toString() },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Breakdown panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* By Category */}
              <div
                className="rounded-xl p-5"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
                >
                  Hours by category
                </h3>
                <div className="space-y-3">
                  {analytics.byType.map((item) => {
                    const pct = (item.hours / analytics.totalHours) * 100;
                    return (
                      <div key={item.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: "var(--text-primary)" }}>{item.type}</span>
                          <span style={{ color: "var(--text-muted)" }}>
                            {item.hours.toFixed(1)}h
                          </span>
                        </div>
                        <div
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: "var(--bg-filter)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: "var(--green-primary)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By Organization */}
              <div
                className="rounded-xl p-5"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
                >
                  Hours by organization
                </h3>
                <div className="space-y-3">
                  {analytics.byOrg.slice(0, 6).map((item) => {
                    const pct = (item.hours / analytics.totalHours) * 100;
                    return (
                      <div key={item.slug}>
                        <div className="flex justify-between text-sm mb-1">
                          <span
                            className="truncate mr-2"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.name}
                          </span>
                          <span className="shrink-0" style={{ color: "var(--text-muted)" }}>
                            {item.hours.toFixed(1)}h
                          </span>
                        </div>
                        <div
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: "var(--bg-filter)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: "var(--green-primary)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Monthly breakdown */}
            {analytics.byMonth.length > 1 && (
              <div
                className="rounded-xl p-5 mb-8"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
                >
                  Monthly activity
                </h3>
                <div className="flex items-end gap-2 h-32">
                  {analytics.byMonth.map((item) => {
                    const maxHours = Math.max(...analytics.byMonth.map((m) => m.hours));
                    const heightPct = maxHours > 0 ? (item.hours / maxHours) * 100 : 0;
                    const [year, month] = item.month.split("-");
                    const monthLabel = new Date(
                      parseInt(year),
                      parseInt(month) - 1
                    ).toLocaleString("default", { month: "short" });
                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {item.hours.toFixed(1)}
                        </span>
                        <div className="w-full flex items-end" style={{ height: "80px" }}>
                          <div
                            className="w-full rounded-t-md transition-all"
                            style={{
                              height: `${Math.max(heightPct, 4)}%`,
                              backgroundColor: "var(--green-primary)",
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {monthLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Log entries list */}
            <div>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
              >
                Recent entries
              </h3>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {log.org_name}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: "var(--tag-type-bg)",
                            color: "var(--tag-type-text)",
                          }}
                        >
                          {log.org_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span>
                          {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {log.notes && (
                          <>
                            <span>·</span>
                            <span className="truncate">{log.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--green-primary)", fontFamily: "'Sora', sans-serif" }}
                      >
                        {Number(log.hours).toFixed(1)}h
                      </span>
                      {deleteConfirm === log.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-xs px-2 py-1 rounded-lg text-white bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(log.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity"
                          style={{ color: "var(--text-muted)" }}
                          aria-label="Delete entry"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <LogHourModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onLogged={fetchLogs}
      />
    </>
  );
}
