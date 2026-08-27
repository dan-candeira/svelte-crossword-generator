import { describe, expect, it } from 'vitest';
import { isKanaAnswer, normalizeKanaAnswer, normalizeKanaInput, parseWordsJson } from './jsonImport';

describe('importação de palavras em JSON', () => {
  it('normaliza kana sem remover dakuten, handakuten, sokuon ou prolongador', () => {
    expect(normalizeKanaAnswer(' がっ こう ')).toBe('がっこう');
    expect(normalizeKanaAnswer(' コー ヒー ')).toBe('コーヒー');
  });

  it('aceita respostas em hiragana e katakana', () => {
    expect(parseWordsJson([{ clue: 'Escola em japonês', answer: 'がっこう' }])).toEqual([
      { clue: 'Escola em japonês', answer: 'がっこう' }
    ]);
    expect(parseWordsJson([{ clue: 'Café em japonês', answer: 'コーヒー' }])).toEqual([
      { clue: 'Café em japonês', answer: 'コーヒー' }
    ]);
    expect(isKanaAnswer('ぱん')).toBe(true);
    expect(isKanaAnswer('ゲーム')).toBe(true);
    expect(normalizeKanaInput('が')).toBe('が');
    expect(normalizeKanaInput('パ')).toBe('パ');
  });

  it('rejeita conteúdo que não seja uma lista de palavras', () => {
    expect(() => parseWordsJson({ clue: 'Bebida', answer: 'CAFE' })).toThrow('lista não vazia');
  });

  it('rejeita itens sem pista ou resposta válida', () => {
    expect(() => parseWordsJson([{ clue: '', answer: 'そら' }])).toThrow('pista inválida');
    expect(() => parseWordsJson([{ clue: 'Astro', answer: '   ' }])).toThrow('hiragana ou katakana');
    expect(() => parseWordsJson([{ clue: 'Romaji', answer: 'neko' }])).toThrow('hiragana ou katakana');
    expect(() => parseWordsJson([{ clue: 'Kanji', answer: '猫' }])).toThrow('hiragana ou katakana');
  });
});
