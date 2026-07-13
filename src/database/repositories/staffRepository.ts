import { ExpoSQLiteBaseRepository } from "./baseRepository";
import { StaffRepositoryInterface } from "./interfaces/staffRepositoryInterface";
import { StaffEntity } from "../models/staff";
import { getDatabaseConnection } from "../config/connection";

class StaffRepository
  extends ExpoSQLiteBaseRepository<StaffEntity>
  implements StaffRepositoryInterface
{
  constructor() {
    super("staff");
  }

  // 1. Método específico para el validador de documentos únicos
  async findByCpf(cpf: string): Promise<StaffEntity | null> {
    const db = await getDatabaseConnection();
    const query = `SELECT * FROM ${this.tableName} WHERE cpf = ? LIMIT 1;`;
    return await db.getFirstAsync<StaffEntity>(query, [cpf]);
  }

  // 2. Método específico para listar personal disponible para asignar a la Daily
  async findAllByStatus(
    status: "active" | "inactive" | "suspended" = "active"
  ): Promise<StaffEntity[]> {
    const db = await getDatabaseConnection();
    const query = `SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY name ASC;`;
    return await db.getAllAsync<StaffEntity>(query, [status]);
  }
  
}

// Exportamos la instancia única (Singleton) para usarla en los servicios
export const staffRepository = new StaffRepository();