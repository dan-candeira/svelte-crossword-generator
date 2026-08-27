import type { InputWord } from './types';

const KANA_CHARACTER = /^[\u3041-\u3096\u309d\u309e\u30a1-\u30fa\u30fc\u30fd\u30fe]$/u;

export function normalizeKanaAnswer(value: string): string {
  return value.normalize('NFC').replace(/\s+/g, '');
}

export function isKanaAnswer(value: string): boolean {
  const normalized = normalizeKanaAnswer(value);
  return (
    normalized.length > 0 &&
    Array.from(normalized).every((character) => KANA_CHARACTER.test(character))
  );
}

export function normalizeKanaInput(value: string): string {
  const characters = Array.from(normalizeKanaAnswer(value));
  return characters.filter((character) => KANA_CHARACTER.test(character)).at(-1) ?? '';
}

export function parseWordsJson(value: unknown): InputWord[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('O JSON deve conter uma lista não vazia de palavras.');
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`O item ${index + 1} deve ser um objeto com clue e answer.`);
    }

    const { clue, answer } = item as Record<string, unknown>;
    if (typeof clue !== 'string' || !clue.trim()) {
      throw new Error(`O item ${index + 1} possui uma pista inválida.`);
    }
    if (typeof answer !== 'string' || !isKanaAnswer(answer)) {
      throw new Error(
        `O item ${index + 1} deve possuir uma resposta somente em hiragana ou katakana.`,
      );
    }

    return { clue: clue.trim(), answer: normalizeKanaAnswer(answer) };
  });
}

export async function parseWordsJsonFile(file: File): Promise<InputWord[]> {
  if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
    throw new Error('Selecione um arquivo JSON válido.');
  }

  try {
    return parseWordsJson(JSON.parse(await file.text()));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Não foi possível ler o JSON. Verifique a sintaxe do arquivo.');
    }
    throw error;
  }
}
