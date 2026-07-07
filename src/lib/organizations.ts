import { supabase } from "./supabase";
import { Organization } from "@/data/types";

// Server-side: fetch a single org by slug
export async function fetchOrgBySlug(slug: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as Organization;
}

// Server-side: fetch all slugs (for generateStaticParams)
export async function fetchAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("slug");

  if (error || !data) return [];
  return data.map((row: { slug: string }) => row.slug);
}
