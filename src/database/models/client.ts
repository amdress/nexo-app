/**
 * Entity — espelha 1:1 a tabela `clients` (SQLite).
 * Empresa contratante (ex: DHL, Mercado Livre).
 */
export interface ClientEntity {
  id: string;
  name: string;
  logo_uri: string | null;
  account_label: string | null;
  site: string | null;
  address: string | null;
  city_state: string | null;
  created_at: string;
}