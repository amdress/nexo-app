/** Turno "borrador" armado en el wizard, antes de existir en BD (sin id/client_id/created_at) */
export interface ClientShiftDraft {
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  demandInfo: string;
  defaultStaffCount: number;
}

/**
 * UI Interface — usada pelo wizard de criação de cliente.
 * shifts é opcional/pode vir vazio: Client pode ser salvo sem turnos
 * e completados depois (decisão confirmada).
 */
export interface ClientCreateDto {
  name: string;
  logoUri?: string | null;
  accountLabel?: string | null;
  site?: string | null;
  address?: string | null;
  cityState?: string | null;
  shifts: ClientShiftDraft[];
  createdAt: string;
}