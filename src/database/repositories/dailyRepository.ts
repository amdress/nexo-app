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
   * junto con la cantidad de funcionarios confirmados para asistir.
   */
  async findActiveDailys(): Promise<DailyAndCounterStaff[]> {
    const db = await getDatabaseConnection();
    
    // Usamos una subconsulta que va directo a contar a la tabla daily_staff
    const query = `
      SELECT 
        ds.*, 
        (
          SELECT COUNT(*) 
          FROM daily_staff dss 
          WHERE dss.daily_id = ds.id 
            AND dss.status IN ('confirmed', 'present')
        ) as confirmed_staff_count
      FROM daily ds
      WHERE ds.status IN ('scheduled', 'in_progress');
    `;

    // 1. Traemos las filas planas de la base de datos
    const rows = await db.getAllAsync<any>(query);

    // 2. Mapeamos hacia la interfaz estandarizada combinada
    return rows.map((row) => {
      const { confirmed_staff_count, ...dailyFields } = row;
      return {
        daily: dailyFields as DailyEntity,
        confirmed_staff_count: confirmed_staff_count || 0,
      };
    });
  }

  
}

// Exportamos como un objeto único ya instanciado (Comportamiento Singleton)
export const dailyRepository = new DailyRepository();