export interface DailyStaffEntity {
  id: string;
  daily_id: string;
  staff_id: string;
  status: 'confirmed' | 'present' | 'no_show' | 'dropped';
  check_in: string | null;
  break_start: string | null;
  break_end: string | null;
  check_out: string | null;
  justification: string | null;
  photo_uri: string | null;
  signature_uri: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: number | null;
}