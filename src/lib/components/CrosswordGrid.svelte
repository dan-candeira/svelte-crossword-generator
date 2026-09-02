<script lang="ts">
  import type { GridCell } from '$lib/types';
  import { cellKey } from '$lib/crossword';
  import GhostCrossword from './GhostCrossword.svelte';

  interface Props {
    grid: GridCell[][];
    letters: Record<string, string>;
    activeWordId: number | null;
    currentRow: number | null;
    currentCol: number | null;
    isGenerating: boolean;
    printStyle: string;
    onFocusCell: (row: number, col: number) => void;
    onToggleDirection: (row: number, col: number) => void;
    onInput: (event: Event, row: number, col: number) => void;
    onCompositionStart: () => void;
    onCompositionEnd: (event: CompositionEvent, row: number, col: number) => void;
    onKeydown: (event: KeyboardEvent) => void;
    element?: HTMLElement;
  }

  let {
    grid,
    letters,
    activeWordId,
    currentRow,
    currentCol,
    isGenerating,
    printStyle,
    onFocusCell,
    onToggleDirection,
    onInput,
    onCompositionStart,
    onCompositionEnd,
    onKeydown,
    element = $bindable(),
  }: Props = $props();
</script>

<div class="print-grid-frame" style={printStyle}>
  {#if isGenerating}
    <GhostCrossword />
  {:else}
    <div
      class="crossword"
      bind:this={element}
      style:grid-template-columns={`repeat(${grid[0]?.length ?? 0}, var(--cell-size))`}
      aria-label="Grade da cruzadinha"
    >
      {#each grid as line, row}
        {#each line as data, col}
          {@const key = cellKey(row, col)}
          {#if data.wordIds.length === 0}
            <div class="cell black" aria-hidden="true"></div>
          {:else}
            <div
              class:active-word={activeWordId !== null && data.wordIds.includes(activeWordId)}
              class:current-cell={currentRow === row && currentCol === col}
              class="cell"
              data-row={row}
              data-col={col}
            >
              {#if data.starts.length > 0}
                <span class="number">{data.starts.join(',')}</span>
              {/if}
              <input
                type="text"
                autocomplete="off"
                inputmode="text"
                lang="ja"
                value={letters[key] ?? ''}
                data-row={row}
                data-col={col}
                aria-label={`Letra na linha ${row + 1}, coluna ${col + 1}`}
                onfocus={() => onFocusCell(row, col)}
                ondblclick={() => onToggleDirection(row, col)}
                oncompositionstart={onCompositionStart}
                oncompositionend={(event) => onCompositionEnd(event, row, col)}
                oninput={(event) => onInput(event, row, col)}
                onkeydown={onKeydown}
              />
            </div>
          {/if}
        {/each}
      {/each}
    </div>
  {/if}
</div>
