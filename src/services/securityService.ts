import DOMPurify from 'dompurify';

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Sanitizes HTML strings using DOMPurify to neutralize XSS payloads.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Recursively strips prototype-pollution keys from parsed JSON payloads.
 */
export function stripDangerousKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => stripDangerousKeys(item)) as unknown as T;
  }
  if (input !== null && typeof input === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (!DANGEROUS_KEYS.has(key)) {
        cleanObj[key] = stripDangerousKeys(value);
      }
    }
    return cleanObj as T;
  }
  return input;
}

/**
 * Safely parses JSON text with size limit check and prototype-pollution protection.
 */
export function safeParseJson(rawText: string, maxBytes = 10 * 1024 * 1024): unknown {
  if (rawText.length > maxBytes) {
    throw new Error('JSON_FILE_TOO_LARGE');
  }
  const parsed: unknown = JSON.parse(rawText);
  return stripDangerousKeys(parsed);
}
