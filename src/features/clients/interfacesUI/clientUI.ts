// src/features/clients/interfacesUI/clientUI.ts

export interface ClientShiftUI {
  id: string;
  clientId: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  demandInfo: string;
  defaultStaffCount: number;
}

export interface ClientUI {
  id: string;
  name: string;
  logoUri: string | null;
  accountLabel: string | null;
  site: string | null;
  address: string | null;
  cityState: string | null;
  shifts?: ClientShiftUI[];
}