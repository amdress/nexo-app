/**
 * Entity — espelha 1:1 a tabela `daily` (SQLite).
 *
 * ⚠️ Schema novo: substitui start_time/end_time/description livres
 * por shift_id (FK RESTRICT para client_shifts). Ver PENDÊNCIA #3
 * no README de handoff: atualizar mapDailyEntityToItem e tudo que
 * lia os campos antigos (EspelhoStep, IndividualReceiptCard, etc.)
 * para buscar horário via JOIN com client_shifts.
 */
export type DailyStatus = 'scheduled' | 'in_progress' | 'completed';

export interface DailyEntity {
  id: string;
  date: string; // YYYY-MM-DD
  status: DailyStatus;
  client_id: string;
  shift_id: string;
  required_staff_count: number;
  leader_name: string | null;
  observations: string | null;
  report_pdf_uri: string | null;
  created_at: string;
}