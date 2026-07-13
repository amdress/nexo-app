// src/database/config/connection.ts
import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Retorna a conexão única (singleton) com o banco de dados SQLite.
 * Cachea la Promise (no el resultado ya resuelto) para evitar que llamadas
 * concurrentes disparen SQLite.openDatabaseAsync() más de una vez.
 */
export function getDatabaseConnection(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('nexo.db')
      .then(async (db) => {
        // PRAGMA es config por-conexión (no persiste en el archivo .db),
        // se garantiza acá una sola vez, sin depender de que runMigrations
        // se ejecute antes.
        await db.execAsync('PRAGMA foreign_keys = ON;');
        console.log('[Database] Conexão estabelecida com nexo.db');
        return db;
      })
      .catch((error) => {
        // Si falla, se libera el caché para permitir un reintento en la próxima llamada
        dbPromise = null;
        console.log('[Database] Falha ao estabelecer conexão com nexo.db');
        throw error;
      });
  }
  return dbPromise;
}