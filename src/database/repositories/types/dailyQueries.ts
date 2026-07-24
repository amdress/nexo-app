import { DailyEntity } from "@/database/models/daily";
import { ClientShiftEntity } from "@/database/models/clientShitf";
 
export interface DailyAndCounterStaff {
  daily: DailyEntity & {
    client_name: string | null;
    client_logo: string | null;
    shift: Pick<
      ClientShiftEntity,
      "name" | "start_time" | "end_time" | "break_duration" | "demand_info"
    > | null;
  };
  confirmed_staff_count: number;
}