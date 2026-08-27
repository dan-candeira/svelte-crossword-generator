import type { Direction, GridCell, InputWord, PlacedWord, WordCell } from './types';

type UnnumberedWord = InputWord & Pick<PlacedWord, 'row' | 'col' | 'direction'>;

export const DEFAULT_WORDS: InputWord[] = [
  { clue: 'Gato em japonês', answer: 'ねこ' },
  { clue: 'Cachorro em japonês', answer: 'いぬ' },
  { clue: 'Escola em japonês', answer: 'がっこう' },
  { clue: 'Água em japonês', answer: 'みず' },
  { clue: 'Flor em japonês', answer: 'はな' },
  { clue: 'Pão em japonês', answer: 'パン' },
  { clue: 'Jogo em japonês', answer: 'ゲーム' },
  { clue: 'Computador em japonês', answer: 'パソコン' },
];

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function answerCharacters(answer: string): string[] {
  return Array.from(answer.normalize('NFC'));
}

export function wordCells(
  word: Pick<PlacedWord, 'answer' | 'row' | 'col' | 'direction'>,
): WordCell[] {
  return answerCharacters(word.answer).map((letter, index) => ({
    row: word.direction === 'H' ? word.row : word.row + index,
    col: word.direction === 'H' ? word.col + index : word.col,
    letter,
  }));
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function occupiedMap(words: UnnumberedWord[]): Map<string, string> {
  return new Map(
    words.flatMap(wordCells).map((cell) => [cellKey(cell.row, cell.col), cell.letter]),
  );
}

function getBounds(words: UnnumberedWord[]) {
  const cells = words.flatMap(wordCells);
  return {
    minRow: Math.min(...cells.map((cell) => cell.row)),
    maxRow: Math.max(...cells.map((cell) => cell.row)),
    minCol: Math.min(...cells.map((cell) => cell.col)),
    maxCol: Math.max(...cells.map((cell) => cell.col)),
  };
}

function canPlace(
  candidate: UnnumberedWord,
  placed: UnnumberedWord[],
  mustCross = false,
  allowCross = true,
): boolean {
  const occupied = occupiedMap(placed);
  const cells = wordCells(candidate);
  let crossings = 0;

  for (const cell of cells) {
    const existing = occupied.get(cellKey(cell.row, cell.col));
    if (existing && existing !== cell.letter) return false;
    if (existing) crossings += 1;
  }

  if (mustCross && crossings === 0) return false;
  if (!allowCross && crossings > 0) return false;

  if (!allowCross) {
    for (const cell of cells) {
      for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
          if (occupied.has(cellKey(cell.row + rowOffset, cell.col + colOffset))) return false;
        }
      }
    }
  }
  return true;
}

function placementScore(candidate: UnnumberedWord, placed: UnnumberedWord[]): number {
  const size = getBounds([...placed, candidate]);
  const height = size.maxRow - size.minRow + 1;
  const width = size.maxCol - size.minCol + 1;
  return Math.abs(width / height - 1) * 20 + width * height * 0.02;
}

function crossingCandidates(word: InputWord, placed: UnnumberedWord[]): UnnumberedWord[] {
  const candidates: UnnumberedWord[] = [];
  const letters = answerCharacters(word.answer);
  for (const other of placed) {
    const otherLetters = answerCharacters(other.answer);
    for (let index = 0; index < letters.length; index += 1) {
      for (let otherIndex = 0; otherIndex < otherLetters.length; otherIndex += 1) {
        if (letters[index] !== otherLetters[otherIndex]) continue;
        const direction: Direction = other.direction === 'H' ? 'V' : 'H';
        candidates.push({
          ...word,
          direction,
          row: direction === 'H' ? other.row + otherIndex : other.row - index,
          col: direction === 'H' ? other.col - index : other.col + otherIndex,
        });
      }
    }
  }
  return candidates.filter((candidate) => canPlace(candidate, placed, true));
}

function isolatedCandidate(
  word: InputWord,
  placed: UnnumberedWord[],
  random: () => number,
): UnnumberedWord {
  const size = getBounds(placed);
  const options: UnnumberedWord[] = [];
  for (let attempt = 0; attempt < 350; attempt += 1) {
    const direction: Direction = random() < 0.5 ? 'H' : 'V';
    const row = Math.floor(random() * (size.maxRow - size.minRow + 13)) + size.minRow - 6;
    const col = Math.floor(random() * (size.maxCol - size.minCol + 13)) + size.minCol - 6;
    const candidate = { ...word, row, col, direction };
    if (canPlace(candidate, placed, false, false)) options.push(candidate);
  }
  options.sort((first, second) => placementScore(first, placed) - placementScore(second, placed));
  return options[0] ?? { ...word, row: size.maxRow + 3, col: size.minCol, direction: 'H' };
}

export function hasValidCrossing(first: UnnumberedWord, second: UnnumberedWord): boolean {
  if (first.direction === second.direction) return false;
  return wordCells(first).some((firstCell) =>
    wordCells(second).some(
      (secondCell) =>
        firstCell.row === secondCell.row &&
        firstCell.col === secondCell.col &&
        firstCell.letter === secondCell.letter,
    ),
  );
}

export function wordsTouchOrCollide(first: UnnumberedWord, second: UnnumberedWord): boolean {
  if (hasValidCrossing(first, second)) return false;
  return wordCells(first).some((firstCell) =>
    wordCells(second).some(
      (secondCell) =>
        Math.abs(firstCell.row - secondCell.row) <= 1 &&
        Math.abs(firstCell.col - secondCell.col) <= 1,
    ),
  );
}

function isSafeLayout(candidate: UnnumberedWord, placed: UnnumberedWord[]): boolean {
  return placed.every((other) => !wordsTouchOrCollide(candidate, other));
}

export function validateGridBeforeRender(
  words: UnnumberedWord[],
  random: () => number = Math.random,
): UnnumberedWord[] {
  const validated: UnnumberedWord[] = [];
  for (const word of words) {
    if (isSafeLayout(word, validated)) {
      validated.push(word);
      continue;
    }

    const crossingOptions = crossingCandidates(word, validated).filter((candidate) =>
      isSafeLayout(candidate, validated),
    );
    if (crossingOptions.length) {
      crossingOptions.sort(
        (first, second) => placementScore(first, validated) - placementScore(second, validated),
      );
      validated.push(crossingOptions[Math.floor(random() * Math.min(4, crossingOptions.length))]);
    } else {
      validated.push(isolatedCandidate(word, validated, random));
    }
  }

  const size = getBounds(validated);
  return validated.map((word) => ({
    ...word,
    row: word.row - size.minRow,
    col: word.col - size.minCol,
  }));
}

export function generateCrossword(
  input: InputWord[],
  random: () => number = Math.random,
): PlacedWord[] {
  if (!input.length) return [];
  const words = shuffle(input, random);
  const placed: UnnumberedWord[] = [
    { ...words[0], row: 0, col: 0, direction: random() < 0.5 ? 'H' : 'V' },
  ];

  for (const word of words.slice(1)) {
    const candidates = crossingCandidates(word, placed);
    if (candidates.length) {
      candidates.sort(
        (first, second) => placementScore(first, placed) - placementScore(second, placed),
      );
      placed.push(candidates[Math.floor(random() * Math.min(4, candidates.length))]);
    } else {
      placed.push(isolatedCandidate(word, placed, random));
    }
  }

  const validWords = validateGridBeforeRender(placed, random);
  const starts = [...validWords].sort(
    (first, second) => first.row - second.row || first.col - second.col,
  );
  const numbersByStart = new Map<string, number>();
  let nextNumber = 1;

  starts.forEach((word) => {
    const key = cellKey(word.row, word.col);
    if (!numbersByStart.has(key)) numbersByStart.set(key, nextNumber++);
  });

  return validWords.map((word, id) => ({
    ...word,
    id: id + 1,
    number: numbersByStart.get(cellKey(word.row, word.col)) ?? 0,
  }));
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
