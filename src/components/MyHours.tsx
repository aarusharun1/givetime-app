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
      return `${orgName},${l.org_type},"${date}",${Number(l.hours).toFixed(2)},${notes}`;
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

  // Header - logo image + subtitle
  const logoB64 = "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";
  const logoW = 120;
  const logoH = logoW * (225 / 933);
  doc.addImage(
    `data:image/png;base64,${logoB64}`,
    "PNG",
    marginL - 5,
    y,
    logoW,
    logoH
  );
  y += logoH + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Volunteer Hour Report", marginL, y);
  y += 12;

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
        <div className="mb-8 pt-2">
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
          >
            Hey, {firstName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {logs.length === 0
              ? "Log your first volunteer hours to get started."
              : (
                <>
                  {`You've logged ${analytics.totalHours.toFixed(1)} hours`}
                  <br />
                  {`across ${analytics.uniqueOrgs} organization${analytics.uniqueOrgs !== 1 ? "s" : ""}.`}
                </>
              )}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {logs.length > 0 && (
              <>
                <button
                  onClick={() => exportCSV(logs, profile?.display_name ?? "")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                    fontFamily: "'Sora', sans-serif",
                  }}
                  title="Export all entries as CSV"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  CSV
                </button>
                <button
                  onClick={() =>
                    exportPDF(logs, analytics, profile?.display_name ?? "")
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                    fontFamily: "'Sora', sans-serif",
                  }}
                  title="Export summary report as PDF"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  PDF
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
              Log hours
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
