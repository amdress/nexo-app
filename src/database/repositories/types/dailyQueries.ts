import { DailyEntity } from "@/database/models/daily";


export interface DailyAndCounterStaff {
    daily : DailyEntity,
    confirmed_staff_count: number
}