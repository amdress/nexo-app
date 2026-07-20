import { SQLiteDatabase } from "expo-sqlite";

export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    -- 1. TABLA: STAFF (Funcionarios)
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT CHECK(status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
      avatar_uri TEXT,
      created_at TEXT NOT NULL
    );

    -- 2. TABLA: CLIENTS (Empresas Contratantes)
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      logo_uri TEXT,
      account_label TEXT,
      site TEXT,
      address TEXT,
      city_state TEXT,
      created_at TEXT NOT NULL
    );

    -- 3. TABLA: DAILY (Jornadas de Trabajo)
    CREATE TABLE IF NOT EXISTS daily (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      required_staff_count INTEGER NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed'
      client_id TEXT,
      report_pdf_uri TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    ); 

    -- 4. TABLA PIVOTE: DAILY_STAFF (Asistencia / Control)
    CREATE TABLE IF NOT EXISTS daily_staff (
      id TEXT PRIMARY KEY NOT NULL,
      daily_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'present', 'no_show', 'dropped'
      check_in TEXT,
      break_start TEXT,
      break_end TEXT,
      check_out TEXT,
      justification TEXT,
      photo_uri TEXT,
      signature_uri TEXT,
      signed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at INTEGER,
      FOREIGN KEY (daily_id) REFERENCES daily(id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
      CONSTRAINT unique_daily_staff UNIQUE (daily_id, staff_id)
    );

    -- 5. ÍNDICES DE OPTIMIZACIÓN (Para búsquedas rápidas)
    CREATE INDEX IF NOT EXISTS idx_staff_cpf ON staff(cpf);
    CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
    CREATE INDEX IF NOT EXISTS idx_daily_date ON daily(date);
    CREATE INDEX IF NOT EXISTS idx_daily_client_id ON daily(client_id);
    CREATE INDEX IF NOT EXISTS idx_pivot_daily_id ON daily_staff(daily_id);
    CREATE INDEX IF NOT EXISTS idx_pivot_staff_id ON daily_staff(staff_id);
  `);
}

export async function down(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DROP INDEX IF EXISTS idx_pivot_staff_id;
    DROP INDEX IF EXISTS idx_pivot_daily_id;
    DROP INDEX IF EXISTS idx_daily_client_id;
    DROP INDEX IF EXISTS idx_daily_date;
    DROP INDEX IF EXISTS idx_clients_name;
    DROP INDEX IF EXISTS idx_staff_cpf;

    DROP TABLE IF EXISTS daily_staff;
    DROP TABLE IF EXISTS daily;
    DROP TABLE IF EXISTS clients;
    DROP TABLE IF EXISTS staff;
  `);
}