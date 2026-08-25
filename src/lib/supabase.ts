import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

export interface HourLog {
  id: string;
  user_id: string;
  org_name: string;
  org_slug: string;
  org_type: string;
  date: string;
  hours: number;
  notes: string;
  /**
   * True for hours imported in bulk through the past-hours wizard rather than
   * logged shift by shift. Rows written before v1.1.0 come back as false.
   */
  is_prior: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  org_name: string;
  org_slug: string;
  org_type: string;
  reminder_date: string;
  created_at: string;
}
