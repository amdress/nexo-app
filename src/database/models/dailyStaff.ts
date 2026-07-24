/**
 * Entity — espelha 1:1 a tabela pivô `daily_staff` (SQLite).
 * UNIQUE(daily_id, staff_id).
 *
 * ⚠️ updated_at está como INTEGER na migration, diferente de todas
 * as outras tabelas (TEXT). Mantido igual ao SQL — confirmar se é
 * intencional (epoch para ordenação) ou typo herdado do schema antigo.
 */
export type DailyStaffStatus = 'confirmed' | 'present' | 'no_show' | 'dropped';

export interface DailyStaffEntity {
  id: string;
  daily_id: string;
  staff_id: string;
  status: DailyStaffStatus;
  check_in: string | null;
  break_start: string | null;
  break_end: string | null;
  check_out: string | null;
  justification: string | null;
  photo_uri: string | null;
  signature_uri: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: number | null; // INTEGER na migration — ver nota acima
}