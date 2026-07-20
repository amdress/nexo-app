import { DailyEntity } from "@/database/models/daily";


export interface DailyAndCounterStaff {
  daily: DailyEntity & {
    client_name: string | null;
    client_logo: string | null;
  };
  confirmed_staff_count: number;
}