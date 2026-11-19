import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../db/database';
import type { AppLanguage, AppSettings, ThemeMode } from '../types/domain';

export function useAppSettings() {
  const { i18n } = useTranslation();
  const settings = useLiveQuery(() => db.appSettings.get('user_settings'), []);

  useEffect(() => {
    if (!settings) return;
    if (i18n.language !== settings.language) {
      void i18n.changeLanguage(settings.language);
    }
    document.documentElement.lang = settings.language;

    const prefersDark =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark =
      settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, [settings, i18n]);

  const updateSettings = async (patch: Partial<Omit<AppSettings, 'id'>>) => {
    const existing = await db.appSettings.get('user_settings');
    if (!existing) return;
    await db.appSettings.put({
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const setLanguage = (language: AppLanguage) => updateSettings({ language });
  const setTheme = (theme: ThemeMode) => updateSettings({ theme });
  const setActiveCertification = (activeCertificationId: string, activeVersionId: string) =>
    updateSettings({ activeCertificationId, activeVersionId });

  return {
    settings,
    updateSettings,
    setLanguage,
    setTheme,
    setActiveCertification,
  };
}
