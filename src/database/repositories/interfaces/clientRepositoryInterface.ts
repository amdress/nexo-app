// src/database/repositories/interfaces/clientRepositoryInterface.ts
import { BaseRepository } from "./baseRepository";
import { ClientEntity } from "@/database/models/client";
import { ClientShiftEntity } from "@/database/models/clientShitf"; // Asegúrate de importar el modelo

// Objeto compuesto para retornos combinados
export interface ClientWithShifts extends ClientEntity {
  shifts: ClientShiftEntity[];
}

export interface ClientRepositoryInterface extends BaseRepository<ClientEntity> {
    
  /** Inserta un cliente junto con su lista de turnos en una sola transacción */
  insertWithShifts(
    client: Omit<ClientEntity, "id">,
    shifts: Omit<ClientShiftEntity, "id" | "client_id">[],
  ): Promise<ClientWithShifts>;

  /** Busca un cliente por ID e incluye sus turnos asociados */
  findByIdWithShifts(id: string): Promise<ClientWithShifts | null>;

  /** Obtiene todos los clientes con sus respectivos turnos */
  findAllWithShifts(): Promise<ClientWithShifts[]>;
}
