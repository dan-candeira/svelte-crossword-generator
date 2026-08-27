<script lang="ts">
  import { tick } from 'svelte';
  import {
    answerCharacters,
    cellKey,
    createGrid,
    DEFAULT_WORDS,
    generateCrossword,
    isWordCorrect,
    wordCells,
  } from '$lib/crossword';
  import { normalizeKanaInput, parseWordsJsonFile } from '$lib/jsonImport';
  import type { Direction, InputWord, PlacedWord } from '$lib/types';
  import { onMount } from 'svelte';

  onMount(() => {
    // Safe to use window here
    // Run on initial load and whenever the window resizes
    window.addEventListener('DOMContentLoaded', () => scaleDivToFit());
    window.addEventListener('load', () => scaleDivToFit());
    window.addEventListener('resize', () => scaleDivToFit());

    scaleDivToFit();
  });

  let sourceWords = $state<InputWord[]>(DEFAULT_WORDS);
  let placedWords = $state<PlacedWord[]>(generateCrossword(DEFAULT_WORDS));
  let letters = $state<Record<string, string>>({});
  let activeWordId = $derived<number | null>(placedWords[0]?.id ?? null);
  let direction = $derived<Direction>(placedWords[0]?.direction ?? 'H');
  let currentRow = $derived<number | null>(placedWords[0]?.row ?? null);
  let currentCol = $derived<number | null>(placedWords[0]?.col ?? null);
  let isComposing = $state(false);
  let status = $state('');
  let element: HTMLElement;
  let parent: HTMLElement;

  let grid = $derived(createGrid(placedWords));
  let activeWord = $derived(placedWords.find((word) => word.id === activeWordId) ?? null);
  let completedIds = $derived.by(
    () =>
      new Set(placedWords.filter((word) => isWordCorrect(word, letters)).map((word) => word.id)),
  );

  function wordsAt(row: number, col: number): PlacedWord[] {
    return placedWords.filter((word) =>
      wordCells(word).some((cell) => cell.row === row && cell.col === col),
    );
  }

  function selectWord(row: number, col: number): void {
    const available = wordsAt(row, col);
    const selected = available.find((word) => word.direction === direction) ?? available[0];
    if (!selected) return;
    activeWordId = selected.id;
    direction = selected.direction;
    currentRow = row;
    currentCol = col;
  }

  function toggleDirection(row: number, col: number): void {
    const opposite = wordsAt(row, col).find((word) => word.direction !== direction);
    if (!opposite) return;
    activeWordId = opposite.id;
    direction = opposite.direction;
    currentRow = row;
    currentCol = col;
  }

  async function focusCell(row: number, col: number): Promise<void> {
    await tick();
    document
      .querySelector<HTMLInputElement>(`input[data-row="${row}"][data-col="${col}"]`)
      ?.focus();
  }

  function moveInActiveWord(step: number): void {
    if (!activeWord || currentRow === null || currentCol === null) return;
    const index =
      activeWord.direction === 'H' ? currentCol - activeWord.col : currentRow - activeWord.row;
    const nextIndex = index + step;
    if (nextIndex < 0 || nextIndex >= answerCharacters(activeWord.answer).length) return;
    const row = activeWord.direction === 'H' ? activeWord.row : activeWord.row + nextIndex;
    const col = activeWord.direction === 'H' ? activeWord.col + nextIndex : activeWord.col;
    void focusCell(row, col);
  }

  function onLetterInput(event: Event, row: number, col: number): void {
    if (isComposing) return;
    const input = event.currentTarget as HTMLInputElement;
    const value = normalizeKanaInput(input.value);
    letters[cellKey(row, col)] = value;
    input.value = value;
  }

  function onCompositionEnd(event: CompositionEvent, row: number, col: number): void {
    isComposing = false;
    onLetterInput(event, row, col);
  }

  function onKeydown(event: KeyboardEvent): void {
    const input = event.currentTarget as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value) {
      event.preventDefault();
      moveInActiveWord(-1);
    } else if (event.key === 'Enter' && input.value) {
      event.preventDefault();
      moveInActiveWord(1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      moveInActiveWord(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveInActiveWord(-1);
    }
  }

  function startGame(words: InputWord[] = sourceWords): void {
    placedWords = generateCrossword(words);
    letters = {};
    activeWordId = placedWords[0]?.id ?? null;
    direction = placedWords[0]?.direction ?? 'H';
    currentRow = placedWords[0]?.row ?? null;
    currentCol = placedWords[0]?.col ?? null;
    status = 'Nova cruzadinha criada. Preencha as letras usando as pistas.';
    setTimeout(() => {
      scaleDivToFit();
    }, 200);
  }

  async function importJson(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      sourceWords = await parseWordsJsonFile(file);
      startGame(sourceWords);
      status = `${sourceWords.length} palavras foram importadas e uma nova grade foi criada.`;
    } catch (error) {
      status = error instanceof Error ? error.message : 'Não foi possível importar o arquivo.';
    } finally {
      input.value = '';
    }
  }

  function selectClue(word: PlacedWord): void {
    activeWordId = word.id;
    direction = word.direction;
    currentRow = word.row;
    currentCol = word.col;
    void focusCell(word.row, word.col);
  }

  function printCrossword(): void {
    window.print();
  }

  function measureNaturalRect() {
      // Temporarily clear transform so we measure the element's natural size
      const prevTransform = element.style.transform;
      element.style.transform = '';
      // getBoundingClientRect returns current size in CSS pixels
      const rect = element.getBoundingClientRect();
      // restore previous transform (we'll set the final transform below)
      element.style.transform = prevTransform;
      return rect;
    }

  function scaleDivToFit() {
    console.warn(element);
    if (!element?.offsetWidth) {
      return;
    }
    const rect = measureNaturalRect();
    const vw = parent.clientWidth;
    const vh = parent.clientWidth;
    // Compute scale so the element fits within viewport; don't upscale above 1
    const scaleX = vw / rect.width;
    const scaleY = vh / rect.height;
    const scale = Math.min(1, scaleX, scaleY);
    console.warn(scale);

    // Apply transform and update wrapper size so browser layout uses the scaled size
    element.style.transformOrigin = 'top left';
    element.style.transform = `scale(${scale})`;
  }
</script>

<main class="app-shell">
  <header class="app-header">
    <div>
      <p class="eyebrow" lang="ja">ニャーニャー</p>
      <h1>Palavras cruzadas</h1>
      <ul class="instructions">
        <li>Clique em uma letra para selecionar uma palavra.</li>
        <li>Dê duplo clique em um cruzamento para alternar entre horizontal e vertical.</li>
      </ul>
    </div>
    <div class="actions no-print">
      <label class="file-picker">
        Importar arquivo
        <input type="file" accept="application/json,.json" onchange={importJson} />
      </label>
      <button type="button" onclick={() => startGame()}>Alterar layout do grid</button>
      <button type="button" class="secondary" onclick={printCrossword}>Imprimir</button>
    </div>
  </header>

  <p class="format-help no-print">
    Formato de entrada do documento: <code
      >[&#123; "clue": "Pista", "answer": "ひらがな" &#125;]</code
    >
  </p>

  {#if status}
    <p class="status" aria-live="polite">
      {status}
    </p>
  {/if}

  <section 
    class="game-layout" 
    aria-label="Cruzadinha e pistas"
    bind:this={parent}
  >
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
              class:active-word={activeWord ? data.wordIds.includes(activeWord.id) : false}
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
                maxlength="1"
                value={letters[key] ?? ''}
                data-row={row}
                data-col={col}
                aria-label={`Letra na linha ${row + 1}, coluna ${col + 1}`}
                onfocus={() => selectWord(row, col)}
                ondblclick={() => toggleDirection(row, col)}
                oncompositionstart={() => {
                  isComposing = true;
                }}
                oncompositionend={(event) => onCompositionEnd(event, row, col)}
                oninput={(event) => onLetterInput(event, row, col)}
                onkeydown={onKeydown}
              />
            </div>
          {/if}
        {/each}
      {/each}
    </div>

    <aside class="clues" aria-label="Pistas">
      <section>
        <h2>Horizontais</h2>
        <ol>
          {#each placedWords.filter((word) => word.direction === 'H') as word (word.id)}
            <li
              value={word.number}
              class:active-clue={word.id === activeWordId}
              class:completed-clue={completedIds.has(word.id)}
            >
              <button type="button" onclick={() => selectClue(word)}>{word.clue}</button>
            </li>
          {/each}
        </ol>
      </section>
      <section>
        <h2>Verticais</h2>
        <ol>
          {#each placedWords.filter((word) => word.direction === 'V') as word (word.id)}
            <li
              value={word.number}
              class:active-clue={word.id === activeWordId}
              class:completed-clue={completedIds.has(word.id)}
            >
              <button type="button" onclick={() => selectClue(word)}>{word.clue}</button>
            </li>
          {/each}
        </ol>
      </section>
    </aside>
  </section>
</main>
