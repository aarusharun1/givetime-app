"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";

function getPreviousMonth() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const monthName = prev.toLocaleString("en-US", { month: "long" });
  const startDate = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = `${prevEnd.getFullYear()}-${String(prevEnd.getMonth() + 1).padStart(2, "0")}-${String(prevEnd.getDate()).padStart(2, "0")}`;
  return { monthName, startDate, endDate };
}

export default function MonthlySummaryBanner() {
  const { user } = useAuth();
  const [hasLogs, setHasLogs] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { monthName, startDate, endDate } = getPreviousMonth();

  useEffect(() => {
    if (!user) return;

    const checkLogs = async () => {
      const { count } = await supabase
        .from("hour_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate);

      setHasLogs((count ?? 0) > 0);
    };

    checkLogs();
  }, [user, startDate, endDate]);

  if (!hasLogs || dismissed) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
      <Link
        href="/summary"
        className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
        style={{
          backgroundColor: "var(--green-light)",
          border: "1px solid var(--green-primary)",
        }}
      >
        <div className="min-w-0">
          <p
            className="text-sm font-semibold"
            style={{
              fontFamily: "'Sora', sans-serif",
              color: "var(--green-primary)",
            }}
          >
            Your summary for {monthName} is ready!
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Tap to view your monthly report
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--green-primary)"
          strokeWidth="2"
          className="shrink-0 ml-2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>
  );
}
