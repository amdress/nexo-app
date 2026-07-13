
export interface StaffPersonalDataUI {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  avatarUri: string | null;
}

export interface StaffHeaderData {
  name: string;
  role: string;
  avatarUrl?: string | null;
  phone?: string | null;
  email?: string | null;
}

// Todos los campos opcionales: se actualiza solo lo que cambió
export interface UpdateStaffDTO {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  role?: string;
  status?: 'active' | 'inactive';
  avatarUri?: string | null;
}

export interface PerformanceUI {
  totalShifts: number;
  presentCount: number;
  noShowCount: number;
  droppedCount: number;
  confirmedCount: number;
  attendanceRate: number; // 0-100
  scoreLabel: 'Excelente' | 'Bom' | 'Regular' | 'Crítico';
}

export interface HistoryItemUI {
  id: string;
  date: string;
  timeRange: string;
  status: 'confirmed' | 'present' | 'no_show' | 'dropped';
  checkIn: string | null;
  checkOut: string | null;
  justification: string | null;
  description: string | null;
}