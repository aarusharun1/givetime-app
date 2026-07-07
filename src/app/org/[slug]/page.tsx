import { Organization } from "@/data/types";
import OrgDetailPage from "@/components/OrgDetailPage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchOrgBySlug, fetchAllSlugs } from "@/lib/organizations";

export async function generateStaticParams() {
  const slugs = await fetchAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrgBySlug(slug);
  if (!org) return { title: "Not Found - GiveTime" };

  return {
    title: `${org.name} - GiveTime`,
    description: org.description,
  };
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await fetchOrgBySlug(slug);
  if (!org) notFound();

  return <OrgDetailPage org={org} />;
}
