/**
 * Entity — espelha 1:1 a tabela `company` (SQLite).
 * Singleton: sempre id = 'default_company'.
 */
export interface CompanyEntity {
  id: string;
  trade_name: string;
  legal_name: string | null;
  cnpj: string | null;
  logo_uri: string | null;
  leader_name: string | null; // config única hasta existir login (ver PENDÊNCIA: 1 líder por vez)
  created_at: string;
  updated_at: string | null;
}