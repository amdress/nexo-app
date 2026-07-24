/**
 * UI Interface — usada pelo wizard de criação de daily.
 *
 * Mudanças vs versão antiga:
 * - startTime/endTime/description saíram (agora vêm do turno via shiftId).
 * - shiftId entra: selecionado no wizard a partir dos client_shifts do client escolhido.
 * - leaderName NÃO entra aqui: até existir login, o dailyService lê
 *   company.leader_name (config única) e preenche daily.leader_name sozinho.
 * - observations é opcional: normalmente preenchida no fechamento da jornada,
 *   não na criação.
 */
export interface DailyCreateDto {
  clientId: string;
  shiftId: string;
  date: string;
  requiredStaffCount: number;
  selectedStaffIds: string[];
  observations?: string;
  createdAt: string;
}