// src/database/repositories/baseRepository.ts
import { getDatabaseConnection } from "../config/connection";
import { BaseRepository } from "./interfaces/baseRepository";

// Solo letras, números y guion bajo, sin empezar con número.
// Protege contra un tableName mal armado (typo, concatenación accidental)
// que terminaría interpolado directo en el SQL.
const SAFE_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export class ExpoSQLiteBaseRepository<
  T extends { id: string },
> implements BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    if (!SAFE_IDENTIFIER.test(tableName)) {
      throw new Error(`[Repository] Nome de tabela inválido: "${tableName}".`);
    }
    this.tableName = tableName;
  }

  // Envuelve errores de SQLite con contexto (tabla + operación),
  // sin perder el mensaje original ni el stack trace.
  protected wrapError(operation: string, error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error);
    const wrapped = new Error(`[${this.tableName}.${operation}] ${message}`);
    if (error instanceof Error) wrapped.stack = error.stack;
    return wrapped;
  }

  // Busca un único registro por su ID. Retorna null si no existe.
  async findById(id: string): Promise<T | null> {
    if (!id)
      throw new Error(`[${this.tableName}.findById] "id" é obrigatório.`);

    try {
      const db = await getDatabaseConnection();
      const query = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1;`;
      return await db.getFirstAsync<T>(query, [id]);
    } catch (error) {
      throw this.wrapError("findById", error);
    }
  }

  // Retorna todos los registros de la tabla, sin orden garantizado.
  // Si una tabla necesita un orden específico por defecto, hacer override en el repositorio hijo.
  async findAll(): Promise<T[]> {
    try {
      const db = await getDatabaseConnection();
      const query = `SELECT * FROM ${this.tableName};`;
      return await db.getAllAsync<T>(query);
    } catch (error) {
      throw this.wrapError("findAll", error);
    }
  }

  // Inserta un registro completo. Los campos `undefined` se normalizan a `null`
  // para evitar errores de binding en SQLite quando uma coluna opcional não vem preenchida.
  async insert(entity: T): Promise<void> {
    const keys = Object.keys(entity);
    if (keys.length === 0) return;

    try {
      const db = await getDatabaseConnection();
      const placeholders = keys.map(() => "?").join(", ");
      const columns = keys.join(", ");

      const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders});`;
      const values = keys.map((key) => {
        const value = (entity as any)[key];
        return value === undefined ? null : value;
      });

      await db.runAsync(query, values);
    } catch (error) {
      throw this.wrapError("insert", error);
    }
  }

  // Actualiza solo los campos definidos (undefined se ignora, no se sobrescribe con null).
  // El 'id' nunca se incluye en el SET, aunque venga dentro del objeto parcial.
  async update(id: string, entity: Partial<T>): Promise<void> {
    if (!id) throw new Error(`[${this.tableName}.update] "id" é obrigatório.`);

    const keys = Object.keys(entity).filter(
      (key) => (entity as any)[key] !== undefined && key !== "id",
    );
    if (keys.length === 0) return;

    try {
      const db = await getDatabaseConnection();
      const setClause = keys.map((key) => `${key} = ?`).join(", ");
      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?;`;

      const values = keys.map((key) => (entity as any)[key]);
      values.push(id);

      await db.runAsync(query, values);
    } catch (error) {
      throw this.wrapError("update", error);
    }
  }

  // Elimina un registro por su ID.
  async delete(id: string): Promise<void> {
    if (!id) throw new Error(`[${this.tableName}.delete] "id" é obrigatório.`);

    try {
      const db = await getDatabaseConnection();
      const query = `DELETE FROM ${this.tableName} WHERE id = ?;`;
      await db.runAsync(query, [id]);
    } catch (error) {
      throw this.wrapError("delete", error);
    }
  }
}
