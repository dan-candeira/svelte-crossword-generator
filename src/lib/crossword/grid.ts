import type { GridCell, PlacedWord } from '$lib/types';
import { cellKey, wordCells } from './coordinates';

function getBounds(words: PlacedWord[]) {
  const cells = words.flatMap(wordCells);
  return {
    maxRow: Math.max(...cells.map((cell) => cell.row)),
    maxCol: Math.max(...cells.map((cell) => cell.col)),
  };
}

export function createGrid(words: PlacedWord[]): GridCell[][] {
  if (!words.length) return [];
  const size = getBounds(words);
  const grid = Array.from({ length: size.maxRow + 1 }, () =>
    Array.from({ length: size.maxCol + 1 }, () => ({ wordIds: [], starts: [] })),
  );
  words.forEach((word) =>
    wordCells(word).forEach((cell, index) => {
      const target = grid[cell.row][cell.col];
      target.wordIds.push(word.id);
      if (index === 0 && !target.starts.includes(word.number)) target.starts.push(word.number);
    }),
  );
  return grid;
}

export function isWordCorrect(word: PlacedWord, letters: Record<string, string>): boolean {
  return wordCells(word).every((cell) => letters[cellKey(cell.row, cell.col)] === cell.letter);
}
