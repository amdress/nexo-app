// src/database/models/client.ts
export interface ClientEntity {
  id: string;
  name: string;
  logo_uri: string | null;
  created_at: string;
}