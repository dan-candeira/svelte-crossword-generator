export interface Word {
	text: string;
	tip: string;
}

export interface Cell {
	letter: string | null;
	number?: number;
	blocked: boolean;
}

export interface Clue {
	number: number;
	direction: 'across' | 'down';
	text: string;
	answer: string;
}

export interface Crossword {
	grid: Cell[][];
	clues: Clue[];
	width: number;
	height: number;
}

export interface CellChangeEvent {
	row: number;
	col: number;
	value: string;
}
