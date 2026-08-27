import { describe, expect, it } from 'vitest';
import {
  createGrid,
  generateCrossword,
  hasValidCrossing,
  isWordCorrect,
  answerCharacters,
  validateGridBeforeRender,
  wordsTouchOrCollide
} from './crossword';
import type { InputWord } from './types';

const predictableRandom = () => 0.25;

describe('gerador de cruzadinha', () => {
  it('posiciona todas as palavras e atribui identificadores', () => {
    const words: InputWord[] = [
      { clue: 'Gato', answer: 'ねこ' },
      { clue: 'Filhote de gato', answer: 'こねこ' },
      { clue: 'Cachorro', answer: 'いぬ' }
    ];

    const placed = generateCrossword(words, predictableRandom);

    expect(placed).toHaveLength(words.length);
    expect(new Set(placed.map((word) => word.id)).size).toBe(words.length);
    expect(placed.every((word) => word.row >= 0 && word.col >= 0 && word.number > 0)).toBe(true);
  });

  it('separa palavras que não possuem cruzamento válido', () => {
    const placed = validateGridBeforeRender([
      { clue: 'Primeira', answer: 'ねこ', row: 0, col: 0, direction: 'H' },
      { clue: 'Segunda', answer: 'そら', row: 0, col: 0, direction: 'H' }
    ], predictableRandom);

    expect(wordsTouchOrCollide(placed[0], placed[1])).toBe(false);
  });

  it('mantém cruzamentos reais e cria células vazias para a separação visual', () => {
    const placed = generateCrossword([
      { clue: 'Felino', answer: 'ねこ' },
      { clue: 'Filhote de gato', answer: 'こねこ' },
      { clue: 'Número um', answer: 'ひとつ' }
    ], predictableRandom);
    const grid = createGrid(placed);
    const hasCrossing = placed.some((word, index) => placed.slice(index + 1).some((other) => hasValidCrossing(word, other)));

    expect(hasCrossing).toBe(true);
    expect(grid.flat().some((cell) => cell.wordIds.length === 0)).toBe(true);
  });

  it('considera correta apenas a palavra com todas as letras preenchidas', () => {
    const [word] = generateCrossword([{ clue: 'Pão', answer: 'ぱん' }], predictableRandom);
    const letters: Record<string, string> = {};

    expect(isWordCorrect(word, letters)).toBe(false);
    answerCharacters(word.answer).forEach((letter, index) => {
      const row = word.direction === 'H' ? word.row : word.row + index;
      const col = word.direction === 'H' ? word.col + index : word.col;
      letters[`${row},${col}`] = letter;
    });
    expect(isWordCorrect(word, letters)).toBe(true);
  });

  it('mantém dakuten, handakuten e sokuon como uma célula cada', () => {
    expect(answerCharacters('がっこう')).toEqual(['が', 'っ', 'こ', 'う']);
    expect(answerCharacters('ぱん')).toEqual(['ぱ', 'ん']);
    expect(answerCharacters('ゲーム')).toEqual(['ゲ', 'ー', 'ム']);
    expect(answerCharacters('パソコン')).toEqual(['パ', 'ソ', 'コ', 'ン']);
  });

  it('não cruza hiragana e katakana visualmente equivalentes', () => {
    expect(hasValidCrossing(
      { clue: 'Hiragana', answer: 'ねこ', row: 0, col: 0, direction: 'H' },
      { clue: 'Katakana', answer: 'ネコ', row: 0, col: 0, direction: 'V' }
    )).toBe(false);
  });
});
