// src/database/repositories/clientRepository.ts
import { ExpoSQLiteBaseRepository } from "./baseRepository";
import { ClientEntity } from "../models/client";

class ClientRepository extends ExpoSQLiteBaseRepository<ClientEntity> {
  constructor() {
    super("clients");
  }

  // findById, findAll, insert, update, delete já vêm prontos do BaseRepository.
  // Se no futuro precisar de queries específicas (ex: findByName), adiciona aqui.
}

export const clientRepository = new ClientRepository();