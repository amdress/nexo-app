/**
 * Entity — espelha 1:1 a tabela `client_shifts` (SQLite).
 * Turno preconfigurado, pertence a um client (FK CASCADE).
 */
export interface ClientShiftEntity {
  id: string;
  client_id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration: string;
  demand_info: string;
  default_staff_count: number;
  created_at: string;
}