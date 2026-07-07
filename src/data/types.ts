export interface Organization {
  id: string;
  name: string;
  slug: string;
  format: string;
  type: string;
  hour_commitment: string;
  min_age: number;
  min_age_display: string;
  parent_required: string;
  description: string;
  location: string;
  county: string;
  link: string;
  image: string;
  last_verified: string;
  created_at: string;
}

export const ORG_TYPES = [
  "Arts",
  "Community",
  "Environment",
  "Health",
  "Housing",
  "Pets",
  "Religious",
  "STEM",
  "Tutoring",
  "Veterans",
  "Youth",
] as const;

export const FORMATS = ["All", "In Person", "Online", "In Person + Online"] as const;

export const COUNTIES = [
  "All",
  "Oakland",
  "Wayne",
  "Washtenaw",
  "Multiple",
  "Virtual",
] as const;

export type OrgType = (typeof ORG_TYPES)[number];
