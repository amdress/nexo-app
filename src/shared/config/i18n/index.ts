// src/shared/config/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import pt from './locales/pt.json';
import es from './locales/es.json';

const STORAGE_KEY = '@user_language';

const resources = {
  pt: { translation: pt },
  es: { translation: es },
};

export type SupportedLanguages = keyof typeof resources;

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    // 🌟 Eliminamos la propiedad fija "lng: 'pt'" para evitar que pise la carga asíncrona
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

export async function initializeLanguage(): Promise<void> {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

    // 1. Si el usuario ya tenía una preferencia guardada y válida, la aplicamos
    if (savedLanguage && Object.prototype.hasOwnProperty.call(resources, savedLanguage)) {
      await i18n.changeLanguage(savedLanguage);
      return;
    }

    // 2. Si es la primera vez, detectamos el idioma del dispositivo
    const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'pt';

    const language: SupportedLanguages = Object.prototype.hasOwnProperty.call(resources, deviceLanguage)
      ? (deviceLanguage as SupportedLanguages)
      : 'pt';

    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    console.error('[i18n] Erro na inicialização:', error);
    await i18n.changeLanguage('pt');
  }
}

export async function changeLanguage(language: SupportedLanguages): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('[i18n] Erro ao mudar idioma:', error);
  }
}

export default i18n;