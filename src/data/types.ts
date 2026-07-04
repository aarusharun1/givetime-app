export interface Organization {
  number: number;
  name: string;
  slug: string;
  format: string;
  type: string;
  hourCommitment: string;
  minAge: number;
  minAgeDisplay: string;
  parentRequired: string;
  description: string;
  location: string;
  county: string;
  countyFilter: string;
  link: string;
  image: string;
  lastVerified: string;
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
