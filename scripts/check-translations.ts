import { fr } from '../src/i18n/locales/fr';
import { en } from '../src/i18n/locales/en';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const frKeys = new Set(flattenKeys(fr as unknown as Record<string, unknown>));
const enKeys = new Set(flattenKeys(en as unknown as Record<string, unknown>));

const missingInEn = [...frKeys].filter((k) => !enKeys.has(k));
const missingInFr = [...enKeys].filter((k) => !frKeys.has(k));

console.log(`FR keys: ${frKeys.size}, EN keys: ${enKeys.size}`);

if (missingInEn.length > 0 || missingInFr.length > 0) {
  console.error('Missing in EN:', missingInEn);
  console.error('Missing in FR:', missingInFr);
  process.exit(1);
}

console.log('All FR/EN translation keys match 100%.');
