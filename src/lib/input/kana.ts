const KANA_CHARACTER = /^[\u3041-\u3096\u309d\u309e\u30a1-\u30fa\u30fc\u30fd\u30fe]$/u;

export function normalizeKanaAnswer(value: string): string {
  return value.normalize('NFC').replace(/\s+/g, '');
}

export function isKanaAnswer(value: string): boolean {
  const normalized = normalizeKanaAnswer(value);
  return normalized.length > 0 && Array.from(normalized).every((character) => KANA_CHARACTER.test(character));
}

export function normalizeKanaInput(value: string): string {
  return Array.from(normalizeKanaAnswer(value)).filter((character) => KANA_CHARACTER.test(character)).at(-1) ?? '';
}
