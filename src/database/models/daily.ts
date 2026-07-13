export interface DailyEntity {
  id: string;
  date: string; // Formato YYYY-MM-DD
  start_time: string; // Formato HH:MM
  end_time: string; // Formato HH:MM
  required_staff_count: number;
  description: string | null; // Es opcional en la BD
  status: 'scheduled' | 'in_progress' | 'completed';
  created_at: string;
}