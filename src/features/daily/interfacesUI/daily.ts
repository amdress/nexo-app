export interface DailyItem {
  id: string;
  clientId: string;
  shiftId?: string;
  date: string;
  startTime: string;
  endTime: string;
  requiredStaffCount: number;
  selectedStaffIds: string[];
  description?: string;
  createdAt?: string;

  // Agregar estas propiedades para la UI:
  status?: "scheduled" | "in_progress" | "completed" | "canceled";
  clientName?: string;
  clientLogo?: string | null;
  dayName?: string;
  dateLabel?: string;
  timeRange?: string;
  confirmedStaffCount?: number;
}



export interface StaffAttendance {
  id: string;
  pivotId?: string;
  name: string;
  role: string;
  avatar: string | null;
  status: 'confirmed' | 'present' | 'no_show' | 'dropped';
  checkIn: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  checkOut: string | null;
  justification?: string | null;
  photoUri?: string | null;
  signatureUri?: string | null;
  signedAt?: string | null;
}

export interface DailyWithStaffUI {
  daily: DailyItem;
  staff: StaffAttendance[];
}



export interface StatusBadgeStyle {
  bg: string;
  text: string;
  border: string;
  label: string;
}




