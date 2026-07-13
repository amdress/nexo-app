export interface StaffUI {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  avatarUri: string | null;
}





//========================================



export interface StaffPerformance {
  attendanceRate: number;
  punctualityRate: number;
  completedTasks: number;
  totalTasks: number;
  evaluationScore: number;
}

export interface StaffHistoryEvent {
  id: string;
  date: string;
  checkIn: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  checkOut: string | null;
  status: 'normal' | 'absence' | 'left_early';
}

export interface StaffHistoryFilter {
  startDate?: string;
  endDate?: string;
}

