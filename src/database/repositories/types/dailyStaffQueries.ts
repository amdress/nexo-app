import { DailyStaffEntity } from "@/database/models/dailyStaff";
import { DailyEntity } from "../../models/daily";


//1
export interface DailyWithStaffDetail {
  daily: DailyEntity;
  staff: Array<{
    id: string;
    name: string;
    role: string;
    avatar_uri: string | null;
    pivot_id: string;
    status: DailyStaffEntity['status'];
    check_in: string | null;
    break_start: string | null;
    break_end: string | null;
    check_out: string | null;
    justification: string | null;
    photo_uri: string | null;
    signature_uri: string | null;
    signed_at: string | null;
  }>;
}

// 6. 
export interface UpdateAttendanceInput {
  status?: DailyStaffEntity['status'];
  check_in?: string | null;
  break_start?: string | null;
  break_end?: string | null;
  check_out?: string | null;
  justification?: string | null;
  photo_uri?: string | null;
  signature_uri?: string | null;
  signed_at?: string | null;
}








// 1. Insumo crudo para el cálculo de performance (asistencia + puntualidad)
export interface PerformanceRawRecord {
  status: 'confirmed' | 'present' | 'no_show' | 'dropped';
  check_in: string | null;
  start_time: string;
}

// 2. Insumo crudo para el historial, con filtro opcional de rango de fechas
export interface HistoryRawRecord {
  id: string;
  shift_date: string;
  check_in: string | null;
  break_start: string | null;
  break_end: string | null;
  check_out: string | null;
  status: 'confirmed' | 'present' | 'no_show' | 'dropped';
}


// 3. Filtro para el historial de un funcionario
export interface StaffHistoryFilter {
  startDate?: string;
  endDate?: string;
}





