import { ExpoSQLiteBaseRepository } from "./baseRepository";
import { DailyStaffRepositoryInterface } from "./interfaces/dailyStaffRepositoryInterface";
import { DailyStaffEntity } from "../models/dailyStaff";
import { getDatabaseConnection } from "../config/connection";
import { 
  PerformanceRawRecord, 
  HistoryRawRecord, 
  StaffHistoryFilter,
  DailyWithStaffDetail,
  UpdateAttendanceInput
} from "./types/dailyStaffQueries";
import { DailyEntity } from "../models/daily";

class DailyStaffRepository
  extends ExpoSQLiteBaseRepository<DailyStaffEntity>
  implements DailyStaffRepositoryInterface
{
  constructor() {
    super("daily_staff");
  }

// 1. Obtiene el detalle de una jornada con su lista completa de funcionarios asignados
/** Busca uma jornada diária com seus funcionários associados */
async findWithStaffById(dailyId: string): Promise<DailyWithStaffDetail | null> {
  const db = await getDatabaseConnection();

  // Obtenemos los datos base de la jornada
  const shiftQuery = `SELECT * FROM daily WHERE id = ? LIMIT 1;`;
  const daily = await db.getFirstAsync<DailyEntity>(shiftQuery, [dailyId]);
  if (!daily) return null;

  // Ataca la tabla pivote (daily_staff) y trae los datos del staff relacionado
  const staffQuery = `
    SELECT 
      s.id, s.name, s.role, s.avatar_uri,
      dss.id AS pivot_id,
      dss.status, dss.check_in, dss.break_start, dss.break_end, dss.check_out, dss.justification,
      dss.photo_uri, dss.signature_uri, dss.signed_at
    FROM ${this.tableName} dss
    INNER JOIN staff s ON s.id = dss.staff_id
    WHERE dss.daily_id = ?
    ORDER BY s.name ASC;
  `;
  const allocatedStaff = await db.getAllAsync<any>(staffQuery, [dailyId]);

  return {
    daily,
    staff: allocatedStaff,
  };
}

/**
   * Actualiza los campos de asistencia de forma dinámica en la tabla pivote
   * utilizando la clave compuesta de la relación (daily_id + staff_id).
   */
  async updateByCompositeId(
    dailyId: string,
    staffId: string,
    data: UpdateAttendanceInput
  ): Promise<void> {
    const db = await getDatabaseConnection();
    const keys = Object.keys(data);
    
    if (keys.length === 0) return;

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    
    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause}, updated_at = ? 
      WHERE daily_id = ? AND staff_id = ?;
    `;

    const values = keys.map((key) => (data as any)[key] ?? null);
    values.push(Date.now(), dailyId, staffId);

    // 🔥 CAMBIO CRÍTICO: Capturamos el resultado de la ejecución
    const result = await db.runAsync(query, values);

    // Si changes es 0, significa que el WHERE no hizo match con ningún registro real
    if (result.changes === 0) {
      throw new Error(
        `Nenhum registro encontrado em ${this.tableName} para daily_id: ${dailyId} e staff_id: ${staffId}`
      );
    }
  }

  // 6. Remueve a un funcionario de una jornada específica
  async removeStaffFromDaily(dailyId: string, staffId: string): Promise<void> {
    const db = await getDatabaseConnection();
    const query = `DELETE FROM ${this.tableName} WHERE daily_id = ? AND staff_id = ?;`;
    await db.runAsync(query, [dailyId, staffId]);
  }











  // 1. Insumo crudo para el cálculo de performance (asistencia + puntualidad)
  async getPerformanceRecords(staffId: string): Promise<PerformanceRawRecord[]> {
    const db = await getDatabaseConnection();
    const query = `
      SELECT dss.status, dss.check_in, ds.start_time
      FROM ${this.tableName} dss
      INNER JOIN daily ds ON dss.daily_id = ds.id
      WHERE dss.staff_id = ?;
    `;
    return await db.getAllAsync<PerformanceRawRecord>(query, [staffId]);
  }



  
  // 2. Insumo crudo para el historial, con filtro opcional de rango de fechas
  async getHistoryRecords(
    staffId: string,
    filter?: StaffHistoryFilter
  ): Promise<HistoryRawRecord[]> {
    const db = await getDatabaseConnection();

    const conditions: string[] = ["dss.staff_id = ?"];
    const params: (string | number)[] = [staffId];

    if (filter?.startDate) {
      conditions.push("ds.date >= ?");
      params.push(filter.startDate);
    }
    if (filter?.endDate) {
      conditions.push("ds.date <= ?");
      params.push(filter.endDate);
    }

    const query = `
      SELECT
        dss.id,
        ds.date AS shift_date,
        dss.check_in,
        dss.break_start,
        dss.break_end,
        dss.check_out,
        dss.status
      FROM ${this.tableName} dss
      INNER JOIN daily ds ON dss.daily_id = ds.id
      WHERE ${conditions.join(" AND ")}
        AND (
          dss.status IN ('present', 'no_show', 'dropped')
          OR (dss.status = 'confirmed' AND dss.check_in IS NOT NULL)
        )
      ORDER BY ds.date DESC
      LIMIT 200;
    `;

    return await db.getAllAsync<HistoryRawRecord>(query, params);
  }

  // 8. Guarda de forma masiva los estados de asistencia de múltiples funcionarios
  
  async saveAllAttendance(
    dailyId: string,
    staffList: Array<{
      staffId: string;
      status: 'confirmed' | 'present' | 'no_show' | 'dropped';
      check_in: string | null;
      break_start: string | null;
      break_end: string | null;
      check_out: string | null;
    }>
  ): Promise<void> {
    const db = await getDatabaseConnection();
    const query = `
      UPDATE ${this.tableName} 
      SET status = ?, check_in = ?, break_start = ?, break_end = ?, check_out = ?, updated_at = ?
      WHERE daily_id = ? AND staff_id = ?;
    `;
    for (const staff of staffList) {
      await db.runAsync(query, [
        staff.status,
        staff.check_in,
        staff.break_start,
        staff.break_end,
        staff.check_out,
        Date.now(),
        dailyId,
        staff.staffId,
      ]);
    }
  }
}

export const dailyStaffRepository = new DailyStaffRepository();
