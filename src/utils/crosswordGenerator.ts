import type { Word, Crossword, Cell, Clue } from '../types';

const GRID_SIZE = 15;
const MIN_WORD_LENGTH = 2;

interface PlacedWord {
  word: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  tip: string;
}

export function generateCrossword(words: Word[]): Crossword {
  const validWords = words.filter(
    (w) => w.text.length >= MIN_WORD_LENGTH && w.text.trim().length > 0
  );

  if (validWords.length === 0) {
    return createEmptyCrossword();
  }

  // Sort by length (longest first) for better placement
  const sortedWords = [...validWords].sort(
    (a, b) => b.text.length - a.text.length
  );

  const grid = initializeGrid(GRID_SIZE);
  const placedWords: PlacedWord[] = [];

  // Place first word horizontally in the middle
  const firstWord = sortedWords[0];
  const startCol = Math.floor((GRID_SIZE - firstWord.text.length) / 2);
  placeWord(
    grid,
    firstWord.text,
    Math.floor(GRID_SIZE / 2),
    startCol,
    'across',
    placedWords,
    firstWord.tip
  );

  // Try to place remaining words
  for (let i = 1; i < sortedWords.length; i++) {
    const word = sortedWords[i];
    let placed = false;

    // Try to intersect with existing words
    for (const placedWord of placedWords) {
      if (placed) break;

      for (let charIdx = 0; charIdx < word.text.length; charIdx++) {
        const char = word.text[charIdx];

        // Find matching characters in placed word
        for (let pwIdx = 0; pwIdx < placedWord.word.length; pwIdx++) {
          if (placedWord.word[pwIdx] === char) {
            // Try placing as across if placed word is down
            if (placedWord.direction === 'down') {
              const newRow = placedWord.row + pwIdx;
              const newCol = placedWord.col - charIdx;

              if (
                canPlaceWord(
                  grid,
                  word.text,
                  newRow,
                  newCol,
                  'across',
                  placedWords
                )
              ) {
                placeWord(
                  grid,
                  word.text,
                  newRow,
                  newCol,
                  'across',
                  placedWords,
                  word.tip
                );
                placed = true;
                break;
              }
            }
            // Try placing as down if placed word is across
            else if (placedWord.direction === 'across') {
              const newRow = placedWord.row - charIdx;
              const newCol = placedWord.col + pwIdx;

              if (
                canPlaceWord(
                  grid,
                  word.text,
                  newRow,
                  newCol,
                  'down',
                  placedWords
                )
              ) {
                placeWord(
                  grid,
                  word.text,
                  newRow,
                  newCol,
                  'down',
                  placedWords,
                  word.tip
                );
                placed = true;
                break;
              }
            }
          }
        }
      }
    }
  }

  // Generate clues and numbering
  const clues = generateClues(placedWords, grid);

  return {
    grid,
    clues,
    width: GRID_SIZE,
    height: GRID_SIZE,
  };
}

function initializeGrid(size: number): Cell[][] {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({ letter: null, blocked: false }))
    );
}

function placeWord(
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down',
  placedWords: PlacedWord[],
  tip: string
) {
  if (direction === 'across') {
    for (let i = 0; i < word.length; i++) {
      grid[row][col + i].letter = word[i];
    }
  } else {
    for (let i = 0; i < word.length; i++) {
      grid[row + i][col].letter = word[i];
    }
  }

  placedWords.push({ word, row, col, direction, tip });
}

function canPlaceWord(
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down',
  placedWords: PlacedWord[]
): boolean {
  // Check bounds
  if (direction === 'across') {
    if (col < 0 || col + word.length > GRID_SIZE) return false;
  } else {
    if (row < 0 || row + word.length > GRID_SIZE) return false;
  }

  // Check conflicts
  if (direction === 'across') {
    for (let i = 0; i < word.length; i++) {
      const cell = grid[row][col + i];
      if (cell.letter && cell.letter !== word[i]) {
        return false;
      }
    }
  } else {
    for (let i = 0; i < word.length; i++) {
      const cell = grid[row + i][col];
      if (cell.letter && cell.letter !== word[i]) {
        return false;
      }
    }
  }

  return true;
}

function generateClues(
  placedWords: PlacedWord[],
  grid: Cell[][]
): Clue[] {
  // Add cell numbers
  const numberMap = new Map<string, number>();
  let currentNumber = 1;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].letter) {
        const isStartOfAcross =
          c === 0 || !grid[r][c - 1].letter || grid[r][c - 1].blocked;
        const isStartOfDown =
          r === 0 || !grid[r - 1][c].letter || grid[r - 1][c].blocked;

        if (isStartOfAcross || isStartOfDown) {
          numberMap.set(`${r}-${c}`, currentNumber);
          grid[r][c].number = currentNumber;
          currentNumber++;
        }
      }
    }
  }

  // Generate clues
  const clues: Clue[] = [];

  for (const placedWord of placedWords) {
    const key = `${placedWord.row}-${placedWord.col}`;
    const number = numberMap.get(key);

    if (number) {
      clues.push({
        number,
        direction: placedWord.direction,
        text: placedWord.tip,
        answer: placedWord.word,
      });
    }
  }

  return clues.sort((a, b) => {
    if (a.number !== b.number) return a.number - b.number;
    return a.direction === 'across' ? -1 : 1;
  });
}

function createEmptyCrossword(): Crossword {
  return {
    grid: initializeGrid(GRID_SIZE),
    clues: [],
    width: GRID_SIZE,
    height: GRID_SIZE,
  };
}
