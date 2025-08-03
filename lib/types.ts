export interface ClassRecord {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  coach_name?: string | null;
  duration?: number | null;
  max_capacity?: number | null;
  price?: number | null;
  day_of_week?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  active?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  image?: string | null;
}

export interface CoachRecord {
  id: number;
  slug: string;
  name: string;
  bio?: string | null;
  certifications?: string | null;
  image?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MediaRecord {
  id: number;
  type?: string | null;
  url: string;
  title?: string | null;
  created_at?: string | null;
}

export interface MembershipPackageRecord {
  id: number;
  name: string;
  description?: string | null;
  price?: number | null;
  features?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
