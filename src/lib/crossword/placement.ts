import type { Direction, InputWord, PlacedWord } from '$lib/types';
import { answerCharacters, cellKey, wordCells } from './coordinates';

type UnnumberedWord = InputWord & Pick<PlacedWord, 'row' | 'col' | 'direction'>;

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

function countCrossingCells(candidate: UnnumberedWord, placed: UnnumberedWord[]): number {
  const occupied = occupiedMap(placed);
  return wordCells(candidate).filter(
    (cell) => occupied.get(cellKey(cell.row, cell.col)) === cell.letter,
  ).length;
}

function countValidCrossings(words: UnnumberedWord[]): number {
  return words.reduce(
    (total, word, index) =>
      total +
      words.slice(index + 1).filter((other) => hasValidCrossing(word, other)).length,
    0,
  );
}

function countIsolatedWords(words: UnnumberedWord[]): number {
  return words.filter(
    (word, index) => !words.some((other, otherIndex) => index !== otherIndex && hasValidCrossing(word, other)),
  ).length;
}

// Menor pontuação representa uma grade menor, mais proporcional e com mais cruzamentos.
function layoutScore(words: UnnumberedWord[]): number {
  const size = getBounds(words);
  const height = size.maxRow - size.minRow + 1;
  const width = size.maxCol - size.minCol + 1;
  const area = width * height;
  const proportionPenalty = Math.abs(width - height) * 4;
  const isolatedPenalty = countIsolatedWords(words) * 25;
  const crossingBonus = countValidCrossings(words) * 20;

  return area * 100 + proportionPenalty + isolatedPenalty - crossingBonus;
}

function candidateScore(candidate: UnnumberedWord, placed: UnnumberedWord[]): number {
  return layoutScore([...placed, candidate]) - countCrossingCells(candidate, placed) * 40;
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
  const uniqueCandidates = new Map<string, UnnumberedWord>();
  candidates.forEach((candidate) => {
    const key = `${candidate.row},${candidate.col},${candidate.direction}`;
    uniqueCandidates.set(key, candidate);
  });
  return [...uniqueCandidates.values()].filter((candidate) => canPlace(candidate, placed, true));
}

// Varre as posições próximas à grade antes de expandir o grid, mantendo palavras isoladas compactas.
function compactIsolatedCandidates(word: InputWord, placed: UnnumberedWord[]): UnnumberedWord[] {
  const size = getBounds(placed);
  const length = answerCharacters(word.answer).length;
  const candidates: UnnumberedWord[] = [];

  for (const direction of ['H', 'V'] as const) {
    for (let row = size.minRow - length - 1; row <= size.maxRow + 1; row += 1) {
      for (let col = size.minCol - length - 1; col <= size.maxCol + 1; col += 1) {
        const candidate = { ...word, row, col, direction };
        if (canPlace(candidate, placed, false, false)) candidates.push(candidate);
      }
    }
  }

  return candidates;
}

function selectBestCandidate(
  candidates: UnnumberedWord[],
  placed: UnnumberedWord[],
  random: () => number,
): UnnumberedWord {
  if (!candidates.length) {
    throw new Error('Não foi possível encontrar uma posição válida para a palavra.');
  }

  const scoredCandidates = candidates
    .map((candidate) => ({ candidate, score: candidateScore(candidate, placed) }))
    .sort((first, second) => first.score - second.score);
  const bestScore = scoredCandidates[0].score;
  const similarCandidates = scoredCandidates.filter(
    ({ score }) => score <= bestScore + 20,
  );
  return similarCandidates[Math.floor(random() * similarCandidates.length)].candidate;
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

function wordConnectionScore(word: InputWord, words: InputWord[]): number {
  const letters = new Set(answerCharacters(word.answer));
  return words
    .filter((other) => other !== word)
    .reduce(
      (score, other) => score + answerCharacters(other.answer).filter((letter) => letters.has(letter)).length,
      0,
    );
}

function orderWordsForPlacement(words: InputWord[], random: () => number): InputWord[] {
  return shuffle(words, random).sort((first, second) => {
    const connectionDifference = wordConnectionScore(second, words) - wordConnectionScore(first, words);
    if (connectionDifference !== 0) return connectionDifference;
    return answerCharacters(second.answer).length - answerCharacters(first.answer).length;
  });
}

function normalizeLayout(words: UnnumberedWord[]): UnnumberedWord[] {
  const size = getBounds(words);
  return words.map((word) => ({
    ...word,
    row: word.row - size.minRow,
    col: word.col - size.minCol,
  }));
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
      validated.push(selectBestCandidate(crossingOptions, validated, random));
    } else {
      const isolatedOptions = compactIsolatedCandidates(word, validated);
      validated.push(selectBestCandidate(isolatedOptions, validated, random));
    }
  }

  return normalizeLayout(validated);
}

function buildLayoutAttempt(words: InputWord[], random: () => number): UnnumberedWord[] {
  const orderedWords = orderWordsForPlacement(words, random);
  const [firstWord, ...remainingWords] = orderedWords;
  const placed: UnnumberedWord[] = [
    { ...firstWord, row: 0, col: 0, direction: random() < 0.5 ? 'H' : 'V' },
  ];

  for (const word of remainingWords) {
    const crossingOptions = crossingCandidates(word, placed).filter((candidate) =>
      isSafeLayout(candidate, placed),
    );
    if (crossingOptions.length) {
      placed.push(selectBestCandidate(crossingOptions, placed, random));
      continue;
    }

    const isolatedOptions = compactIsolatedCandidates(word, placed);
    placed.push(selectBestCandidate(isolatedOptions, placed, random));
  }

  return validateGridBeforeRender(placed, random);
}

export function generateCrossword(
  input: InputWord[],
  random: () => number = Math.random,
): PlacedWord[] {
  if (!input.length) return [];
  const attempts = Math.min(48, Math.max(16, input.length * 4));
  let bestLayout = buildLayoutAttempt(input, random);

  for (let attempt = 1; attempt < attempts; attempt += 1) {
    const candidateLayout = buildLayoutAttempt(input, random);
    if (layoutScore(candidateLayout) < layoutScore(bestLayout)) {
      bestLayout = candidateLayout;
    }
  }

  const validWords = bestLayout;
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
