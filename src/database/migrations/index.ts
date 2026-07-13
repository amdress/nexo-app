import { SQLiteDatabase } from 'expo-sqlite';
import { getDatabaseConnection } from '../config/connection';
import * as migration001 from './001_initial_schema';

interface MigrationRegistry {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
}

const MIGRATIONS: MigrationRegistry[] = [
  { version: 1, up: migration001.up },
];

export async function runMigrations(): Promise<void> {
  const db = await getDatabaseConnection();

  await db.execAsync('PRAGMA foreign_keys = ON;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      executed_at TEXT NOT NULL
    );
  `);

  const result = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM schema_migrations;'
  );

  const currentVersion = result?.version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      console.log(`[Database] Aplicando migração versão ${migration.version}...`);

      await migration.up(db);

      await db.runAsync(
        'INSERT INTO schema_migrations (version, executed_at) VALUES (?, ?);',
        [migration.version, new Date().toISOString()]
      );
    }
  }

  console.log('[Database] Todas as migrações estão atualizadas.');
}