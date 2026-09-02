import type { Direction, WordCell } from '$lib/types';

export interface WordPosition {
  answer: string;
  row: number;
  col: number;
  direction: Direction;
}

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function answerCharacters(answer: string): string[] {
  return Array.from(answer.normalize('NFC'));
}

export function wordCells(word: WordPosition): WordCell[] {
  return answerCharacters(word.answer).map((letter, index) => ({
    row: word.direction === 'H' ? word.row : word.row + index,
    col: word.direction === 'H' ? word.col + index : word.col,
    letter,
  }));
}
