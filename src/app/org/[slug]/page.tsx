import organizations from "@/data/organizations.json";
import { Organization } from "@/data/types";
import OrgDetailPage from "@/components/OrgDetailPage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const orgs = organizations as Organization[];

export function generateStaticParams() {
  return orgs.map((org) => ({ slug: org.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = orgs.find((o) => o.slug === slug);
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
  const org = orgs.find((o) => o.slug === slug);
  if (!org) notFound();

  return <OrgDetailPage org={org} />;
}
