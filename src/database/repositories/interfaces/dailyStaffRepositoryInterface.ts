import { BaseRepository } from "./baseRepository";
import { DailyStaffEntity } from "../../models/dailyStaff";
import { 
  PerformanceRawRecord, 
  HistoryRawRecord, 
  StaffHistoryFilter, 
  DailyWithStaffDetail,
  UpdateAttendanceInput
} from "../types/dailyStaffQueries";

export interface DailyStaffRepositoryInterface extends BaseRepository<DailyStaffEntity> {
  
  /* Dailys*/
  findWithStaffById(id: string): Promise<any | null>;
  updateByCompositeId(dailyId: string, staffId: string,data: UpdateAttendanceInput): Promise<void>;
  removeStaffFromDaily(dailyShiftId: string, staffId: string): Promise<void>;
  



  /* staff*/
  getPerformanceRecords(staffId: string): Promise<PerformanceRawRecord[]>;
  getHistoryRecords(staffId: string, filter?: StaffHistoryFilter): Promise<HistoryRawRecord[]>;
  saveAllAttendance(dailyShiftId: string, staffList: any[]): Promise<void>;
  
}