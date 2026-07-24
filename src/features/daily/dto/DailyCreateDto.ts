
export interface DailyCreateDto {
  clientId: string;
  shiftId: string;
  date: string;
  requiredStaffCount: number;
  selectedStaffIds: string[];
  observations?: string;
  createdAt: string;
}