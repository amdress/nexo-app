// src/features/settings/services/companyProfileService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPANY_NAME_KEY = '@company_profile_name';
const COMPANY_LOGO_KEY = '@company_profile_logo_uri';

export interface CompanyProfile {
  name: string | null;
  logoUri: string | null;
}

export const companyProfileService = {
  /** Busca o perfil da empresa contratista (MMG) salvo localmente */
  async getProfile(): Promise<CompanyProfile> {
    const [name, logoUri] = await Promise.all([
      AsyncStorage.getItem(COMPANY_NAME_KEY),
      AsyncStorage.getItem(COMPANY_LOGO_KEY),
    ]);
    return { name, logoUri };
  },
};