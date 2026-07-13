import { BaseRepository } from "./baseRepository";
import { DailyEntity } from "../../models/daily";
import { DailyAndCounterStaff } from "../types/dailyQueries";

// Esta interfaz hereda findById, findAll, insert, etc., y SOLO declara lo específico de las dailies
export interface DailyRepositoryInterface extends BaseRepository<DailyEntity> {
  
/** Busca todas as jornadas ativas junto com o contador de staff confirmado */
  findActiveDailys(): Promise<DailyAndCounterStaff[]>;
  
}