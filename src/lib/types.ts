export type Direction = 'H' | 'V';

export interface InputWord {
  clue: string;
  answer: string;
  createdAt?: Date;
  wordId: Date;
}

export type InputWords = InputWord[];

export interface PlacedWord extends InputWord {
  id: number;
  number: number;
  row: number;
  col: number;
  direction: Direction;
}

export interface WordCell {
  row: number;
  col: number;
  letter: string;
}

export interface GridCell {
  wordIds: number[];
  starts: number[];
}
