// src/features/clients/interacesUI/clientUI.ts
export interface ClientUI {
  id: string;
  name: string;
  logoUri: string | null;
  accountLabel: string | null;
  site: string | null;
  address: string | null;
  cityState: string | null;
}