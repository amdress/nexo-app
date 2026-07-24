import { SQLiteDatabase } from "expo-sqlite";

export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    -- 1. TABLA: COMPANY (Empresa Prestadora / MMG — Singleton, quem usa o app)
    CREATE TABLE IF NOT EXISTS company (
      id TEXT PRIMARY KEY NOT NULL DEFAULT 'default_company',
      trade_name TEXT NOT NULL,         -- Nome fantasia (ex: MMG)
      legal_name TEXT,                  -- Razão Social
      cnpj TEXT,                        -- CNPJ da empresa
      logo_uri TEXT,                    -- Logo da empresa prestadora
      leader_name TEXT,                 -- Nome do líder (config única até existir login)
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    -- 2. TABLA: STAFF (Funcionarios) — sem mudanças
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

    -- 3. TABLA: CLIENTS (Empresas Contratantes, ex: DHL) — sem mudanças
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

    -- 4. TABLA: CLIENT_SHIFTS (Turnos do cliente — 1 cliente pode ter N turnos)
    CREATE TABLE IF NOT EXISTS client_shifts (
      id TEXT PRIMARY KEY NOT NULL,
      client_id TEXT NOT NULL,
      name TEXT NOT NULL,               -- ex: "Turno 1 - Diurno"
      start_time TEXT NOT NULL,         -- ex: "08:00"
      end_time TEXT NOT NULL,           -- ex: "17:48"
      break_duration TEXT NOT NULL,     -- ex: "1h"
      demand_info TEXT NOT NULL,        -- ex: "SEG A SEX E DOM"
      default_staff_count INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    -- 5. TABLA: DAILY (Jornadas) — horário/descrição livre saem, entra shift_id
    CREATE TABLE IF NOT EXISTS daily (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,               -- YYYY-MM-DD
      status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed'
      client_id TEXT NOT NULL,
      shift_id TEXT NOT NULL,
      required_staff_count INTEGER NOT NULL, -- autocompletado com default_staff_count do turno
      leader_name TEXT,
      observations TEXT,
      report_pdf_uri TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
      FOREIGN KEY (shift_id) REFERENCES client_shifts(id) ON DELETE RESTRICT
    );

    -- 6. TABLA PIVOTE: DAILY_STAFF — sem mudanças
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

    -- 7. ÍNDICES
    CREATE INDEX IF NOT EXISTS idx_staff_cpf ON staff(cpf);
    CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
    CREATE INDEX IF NOT EXISTS idx_client_shifts_client_id ON client_shifts(client_id);
    CREATE INDEX IF NOT EXISTS idx_daily_date ON daily(date);
    CREATE INDEX IF NOT EXISTS idx_daily_client_id ON daily(client_id);
    CREATE INDEX IF NOT EXISTS idx_daily_shift_id ON daily(shift_id);
    CREATE INDEX IF NOT EXISTS idx_pivot_daily_id ON daily_staff(daily_id);
    CREATE INDEX IF NOT EXISTS idx_pivot_staff_id ON daily_staff(staff_id);
  `);
}

export async function down(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DROP INDEX IF EXISTS idx_pivot_staff_id;
    DROP INDEX IF EXISTS idx_pivot_daily_id;
    DROP INDEX IF EXISTS idx_daily_shift_id;
    DROP INDEX IF EXISTS idx_daily_client_id;
    DROP INDEX IF EXISTS idx_daily_date;
    DROP INDEX IF EXISTS idx_client_shifts_client_id;
    DROP INDEX IF EXISTS idx_clients_name;
    DROP INDEX IF EXISTS idx_staff_cpf;

    DROP TABLE IF EXISTS daily_staff;
    DROP TABLE IF EXISTS daily;
    DROP TABLE IF EXISTS client_shifts;
    DROP TABLE IF EXISTS clients;
    DROP TABLE IF EXISTS staff;
    DROP TABLE IF EXISTS company;
  `);
}