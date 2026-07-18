export interface DailyCreateDto {
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  requiredStaffCount: number;
  selectedStaffIds: string[];
  description: string;
  createdAt: string;
}
