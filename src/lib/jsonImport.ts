import type { InputWord } from './types';
import { isKanaAnswer, normalizeKanaAnswer } from './input/kana';

export { isKanaAnswer, normalizeKanaAnswer, normalizeKanaInput } from './input/kana';

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
