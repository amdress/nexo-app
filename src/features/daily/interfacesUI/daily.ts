export interface DailyItem {
  id: string;
  dateLabel: string;
  dayName: string;
  timeRange: string;
  description: string;
  requiredStaffCount: number;
  confirmedStaffCount: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  clientName: string | null;  
  clientLogo: string | null;  
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




