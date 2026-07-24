import { ExpoSQLiteBaseRepository } from "./baseRepository";
import { DailyRepositoryInterface } from "./interfaces/dailyRepositoryInterface";
import { DailyEntity } from "../models/daily";
import { getDatabaseConnection } from "../config/connection";
import { DailyAndCounterStaff } from "./types/dailyQueries";

class DailyRepository
  extends ExpoSQLiteBaseRepository<DailyEntity>
  implements DailyRepositoryInterface
{
  constructor() {
    // Le pasamos el nombre de la tabla a la clase base genérica
    super("daily");
  }

  
  /**
   * Obtiene únicamente las jornadas ACTIVAS (no completadas),
   * junto con la cantidad de funcionarios confirmados para assistir,
   * acrescido do nome/logo do cliente contratante e do turno
   * (client_shifts via shift_id), agora tipado com ClientShiftEntity
   * em vez de campos soltos.
   */
  async findActiveDailys(): Promise<DailyAndCounterStaff[]> {
    const db = await getDatabaseConnection();

    const query = `
    SELECT 
      ds.*, 
      c.name as client_name,
      c.logo_uri as client_logo,
      cs.name as shift_name,
      cs.start_time as shift_start_time,
      cs.end_time as shift_end_time,
      cs.break_duration as shift_break_duration,
      cs.demand_info as shift_demand_info,
      (
        SELECT COUNT(*) 
        FROM daily_staff dss 
        WHERE dss.daily_id = ds.id 
          AND dss.status IN ('confirmed', 'present')
      ) as confirmed_staff_count
    FROM daily ds
    LEFT JOIN clients c ON ds.client_id = c.id
    LEFT JOIN client_shifts cs ON ds.shift_id = cs.id
    WHERE ds.status IN ('scheduled', 'in_progress');
  `;

    const rows = await db.getAllAsync<any>(query);

    return rows.map((row) => {
      const {
        confirmed_staff_count,
        client_name,
        client_logo,
        shift_name,
        shift_start_time,
        shift_end_time,
        shift_break_duration,
        shift_demand_info,
        ...dailyFields
      } = row;

      return {
        daily: {
          ...dailyFields,
          client_name: client_name || null,
          client_logo: client_logo || null,
          shift: shift_name
            ? {
                name: shift_name,
                start_time: shift_start_time,
                end_time: shift_end_time,
                break_duration: shift_break_duration,
                demand_info: shift_demand_info,
              }
            : null,
        } as DailyAndCounterStaff["daily"],
        confirmed_staff_count: confirmed_staff_count || 0,
      };
    });
  }
}

// Exportamos como un objeto único ya instanciado (Comportamiento Singleton)
export const dailyRepository = new DailyRepository();
