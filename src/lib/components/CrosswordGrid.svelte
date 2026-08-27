<script lang="ts">
  import type { Cell, CellChangeEvent } from '$lib/utils/types';

  let { grid, answers, showAnswers, oncellChange }: {
    grid: Cell[][];
    answers: { [key: string]: string };
    showAnswers: boolean;
    oncellChange: (event: CellChangeEvent) => void;
  } = $props();

  let selectedCell: { row: number; col: number } | null = $state(null);

  function handleCellClick(row: number, col: number) {
    if (grid[row] && !grid[row][col].blocked) {
      selectedCell = { row, col };
    }
  }

  function handleInput(
    event: Event & { currentTarget: HTMLInputElement },
    row: number,
    col: number
  ) {
    const value = event.currentTarget.value.toUpperCase().slice(-1);
    oncellChange({ row, col, value });
    answers[`${row}-${col}`] = value;

    // Move to next cell on input
    if (value) {
      const nextCell = getNextCell(row, col);
      if (nextCell) {
        selectedCell = nextCell;
        setTimeout(() => {
          const input = document.querySelector(
            `input[data-row="${nextCell.row}"][data-col="${nextCell.col}"]`
          ) as HTMLInputElement;
          input?.focus();
        }, 0);
      }
    }
  }

  function getNextCell(
    row: number,
    col: number
  ): { row: number; col: number } | null {
    // Try right
    if (col + 1 < grid[row].length && !grid[row][col + 1].blocked) {
      return { row, col: col + 1 };
    }
    // Try next row
    if (row + 1 < grid.length) {
      for (let c = 0; c < grid[row + 1].length; c++) {
        if (!grid[row + 1][c].blocked) {
          return { row: row + 1, col: c };
        }
      }
    }
    return null;
  }

  function handleKeyDown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement },
    row: number,
    col: number
  ) {
    if (event.key === 'Backspace') {
      event.currentTarget.value = '';
      answers[`${row}-${col}`] = '';
    }
  }
</script>

<div class="grid-wrapper">
  <div class="grid" style="--size: {grid.length}">
    {#each grid as row, r (r)}
      {#each row as cell, c (c)}
        <div class="cell-wrapper" class:blocked={cell.blocked}>
          {#if !cell.blocked}
            {#if cell.number}
              <span class="cell-number">{cell.number}</span>
            {/if}
            <input
              type="text"
              maxlength="1"
              value={showAnswers ? cell.letter || '' : answers[`${r}-${c}`] || ''}
              oninput={(e) => handleInput(e, r, c)}
              onkeydown={(e) => handleKeyDown(e, r, c)}
              onclick={() => handleCellClick(r, c)}
              class:selected={selectedCell?.row === r && selectedCell?.col === c}
              class:filled={answers[`${r}-${c}`]}
              class:answer={showAnswers && cell.letter}
              data-row={r}
              data-col={c}
              disabled={showAnswers}
            />
          {/if}
        </div>
      {/each}
    {/each}
  </div>
</div>

<style>
  .grid-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .grid {
    display: inline-grid;
    grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
    gap: 0;
    border: 3px solid #333;
    background: white;
  }

  .cell-wrapper {
    position: relative;
    aspect-ratio: 1;
    border: 1px solid #999;
  }

  .cell-wrapper.blocked {
    background: #333;
    border: 1px solid #000;
  }

  input {
    width: 100%;
    height: 100%;
    border: none;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    padding: 0;
    text-transform: uppercase;
    font-family: 'Courier New', monospace;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  input:focus {
    outline: none;
    background: #fff3cd;
  }

  input.selected {
    background: #e7f3ff;
  }

  input.filled {
    background: #f0f0f0;
  }

  input.answer {
    background: #d4edda;
    cursor: default;
  }

  input:disabled {
    cursor: default;
  }

  .cell-number {
    position: absolute;
    top: 1px;
    left: 1px;
    font-size: 0.7rem;
    font-weight: bold;
    color: #333;
    line-height: 1;
    padding: 1px 2px;
  }
</style>
