// src/database/repositories/clientRepository.ts
import * as Crypto from "expo-crypto";
import { ExpoSQLiteBaseRepository } from "./baseRepository";
import { ClientEntity } from "../models/client";
import { ClientShiftEntity } from "../models/clientShitf";
import {
  ClientRepositoryInterface,
  ClientWithShifts,
} from "./interfaces/clientRepositoryInterface";
import { getDatabaseConnection } from "../config/connection";

class ClientRepository
  extends ExpoSQLiteBaseRepository<ClientEntity>
  implements ClientRepositoryInterface
{
  constructor() {
    super("clients");
  }

  async insertWithShifts(
    clientData: Omit<ClientEntity, "id">,
    shiftsData: Omit<ClientShiftEntity, "id" | "client_id">[]
  ): Promise<ClientWithShifts> {
    const db = await getDatabaseConnection();

    const clientId = Crypto.randomUUID(); 
    const createdAt = new Date().toISOString();

    const clientToInsert: ClientEntity = {
      id: clientId,
      ...clientData,
      created_at: clientData.created_at || createdAt,
    };

    await db.withTransactionAsync(async () => {
      // 1. Insertar Cliente
      await db.runAsync(
        `INSERT INTO clients (id, name, logo_uri, account_label, site, address, city_state, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          clientToInsert.id,
          clientToInsert.name,
          clientToInsert.logo_uri || null,
          clientToInsert.account_label || null,
          clientToInsert.site || null,
          clientToInsert.address || null,
          clientToInsert.city_state || null,
          clientToInsert.created_at,
        ]
      );

      // 2. Insertar Turnos asociados
      for (const shift of shiftsData) {
        const shiftId = Crypto.randomUUID(); 
        await db.runAsync(
          `INSERT INTO client_shifts (id, client_id, name, start_time, end_time, break_duration, demand_info, default_staff_count, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            shiftId,
            clientId,
            shift.name,
            shift.start_time,
            shift.end_time,
            shift.break_duration,
            shift.demand_info,
            shift.default_staff_count ?? 1,
            shift.created_at || createdAt,
          ]
        );
      }
    });

    return this.findByIdWithShifts(clientId) as Promise<ClientWithShifts>;
  }

  async findByIdWithShifts(id: string): Promise<ClientWithShifts | null> {
    const db = await getDatabaseConnection();

    const client = await db.getFirstAsync<ClientEntity>(
      `SELECT * FROM clients WHERE id = ?;`,
      [id]
    );

    if (!client) return null;

    const shifts = await db.getAllAsync<ClientShiftEntity>(
      `SELECT * FROM client_shifts WHERE client_id = ? ORDER BY created_at ASC;`,
      [id]
    );

    return {
      ...client,
      shifts: shifts || [],
    };
  }

  async findAllWithShifts(): Promise<ClientWithShifts[]> {
    const db = await getDatabaseConnection();

    const clients = await db.getAllAsync<ClientEntity>(
      `SELECT * FROM clients ORDER BY created_at DESC;`
    );

    if (!clients || clients.length === 0) return [];

    const result: ClientWithShifts[] = [];

    for (const client of clients) {
      const shifts = await db.getAllAsync<ClientShiftEntity>(
        `SELECT * FROM client_shifts WHERE client_id = ? ORDER BY created_at ASC;`,
        [client.id]
      );

      result.push({
        ...client,
        shifts: shifts || [],
      });
    }

    return result;
  }

  // =========================================================================
  // OPERACIONES DIRECTAS SOBRE CLIENT_SHIFTS
  // =========================================================================

  /**
   * Inserta un nuevo turno para un cliente específico en client_shifts
   */
  async insertShift(
    clientId: string,
    shiftData: Omit<ClientShiftEntity, "id" | "client_id">
  ): Promise<ClientShiftEntity> {
    const db = await getDatabaseConnection();
    const shiftId = Crypto.randomUUID();
    const createdAt = shiftData.created_at || new Date().toISOString();

    await db.runAsync(
      `INSERT INTO client_shifts (id, client_id, name, start_time, end_time, break_duration, demand_info, default_staff_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        shiftId,
        clientId,
        shiftData.name,
        shiftData.start_time,
        shiftData.end_time,
        shiftData.break_duration,
        shiftData.demand_info,
        shiftData.default_staff_count ?? 1,
        createdAt,
      ]
    );

    return {
      id: shiftId,
      client_id: clientId,
      name: shiftData.name,
      start_time: shiftData.start_time,
      end_time: shiftData.end_time,
      break_duration: shiftData.break_duration,
      demand_info: shiftData.demand_info,
      default_staff_count: shiftData.default_staff_count ?? 1,
      created_at: createdAt,
    };
  }

  /**
   * Actualiza un turno existente directamente en client_shifts
   */
  async updateShift(
    shiftId: string,
    shiftData: Partial<Omit<ClientShiftEntity, "id" | "client_id" | "created_at">>
  ): Promise<void> {
    const db = await getDatabaseConnection();

    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (shiftData.name !== undefined) {
      fieldsToUpdate.push("name = ?");
      values.push(shiftData.name);
    }
    if (shiftData.start_time !== undefined) {
      fieldsToUpdate.push("start_time = ?");
      values.push(shiftData.start_time);
    }
    if (shiftData.end_time !== undefined) {
      fieldsToUpdate.push("end_time = ?");
      values.push(shiftData.end_time);
    }
    if (shiftData.break_duration !== undefined) {
      fieldsToUpdate.push("break_duration = ?");
      values.push(shiftData.break_duration);
    }
    if (shiftData.demand_info !== undefined) {
      fieldsToUpdate.push("demand_info = ?");
      values.push(shiftData.demand_info);
    }
    if (shiftData.default_staff_count !== undefined) {
      fieldsToUpdate.push("default_staff_count = ?");
      values.push(shiftData.default_staff_count);
    }

    if (fieldsToUpdate.length === 0) return;

    values.push(shiftId);

    const query = `UPDATE client_shifts SET ${fieldsToUpdate.join(", ")} WHERE id = ?;`;
    await db.runAsync(query, values);
  }

  /**
   * Elimina un turno de la tabla client_shifts por su ID
   */
  async deleteShift(shiftId: string): Promise<void> {
    const db = await getDatabaseConnection();
    await db.runAsync(`DELETE FROM client_shifts WHERE id = ?;`, [shiftId]);
  }
}

export const clientRepository = new ClientRepository();