"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { Organization } from "@/data/types";

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrgs() {
      const { data, error: fetchError } = await supabase
        .from("organizations")
        .select("*")
        .order("name");

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setOrganizations(data as Organization[]);
      setLoading(false);
    }

    fetchOrgs();
    return () => { cancelled = true; };
  }, []);

  return { organizations, loading, error };
}
