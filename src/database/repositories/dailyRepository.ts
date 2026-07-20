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
   * acrescido do nome e logo do cliente contratante.
   */
  async findActiveDailys(): Promise<DailyAndCounterStaff[]> {
    const db = await getDatabaseConnection();
    
    // Mantemos sua estrutura intacta e APENAS acrescentamos o LEFT JOIN e os campos do cliente
    const query = `
      SELECT 
        ds.*, 
        c.name as client_name,
        c.logo_uri as client_logo,
        (
          SELECT COUNT(*) 
          FROM daily_staff dss 
          WHERE dss.daily_id = ds.id 
            AND dss.status IN ('confirmed', 'present')
        ) as confirmed_staff_count
      FROM daily ds
      LEFT JOIN clients c ON ds.client_id = c.id
      WHERE ds.status IN ('scheduled', 'in_progress');
    `;

    // 1. Traemos las filas planas de la base de datos
    const rows = await db.getAllAsync<any>(query);

    // 2. Mapeamos hacia la interfaz estandarizada combinada
    return rows.map((row) => {
      // Acrescentamos client_name e client_logo na desestruturação sem quebrar o resto
      const { confirmed_staff_count, client_name, client_logo, ...dailyFields } = row;
      
      return {
        daily: {
          ...dailyFields,
          client_name: client_name || null,
          client_logo: client_logo || null,
        } as DailyEntity & { client_name: string | null; client_logo: string | null; },
        confirmed_staff_count: confirmed_staff_count || 0,
      };
    });
  }
  
}

// Exportamos como un objeto único ya instanciado (Comportamiento Singleton)
export const dailyRepository = new DailyRepository();