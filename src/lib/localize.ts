import type { AppLanguage, LocalizedText } from '../types/domain';

export function getLocalizedText(
  text: LocalizedText | undefined,
  lang: AppLanguage,
): { value: string; isFallback: boolean } {
  if (!text) {
    return { value: '', isFallback: false };
  }
  const primary = text[lang]?.trim();
  if (primary) {
    return { value: primary, isFallback: false };
  }
  const secondaryLang: AppLanguage = lang === 'fr' ? 'en' : 'fr';
  const fallback = text[secondaryLang]?.trim() ?? '';
  return { value: fallback, isFallback: Boolean(fallback) };
}

export function tText(text: LocalizedText | undefined, lang: AppLanguage): string {
  return getLocalizedText(text, lang).value;
}
