// src/database/models/client.ts
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