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
  import { keyHandler } from '$lib/utils/keyboard-handler';

  type PaperSize = 'A4' | 'A3' | 'Letter';

  const ghostCells = Array.from({ length: 64 });
  const paperDimensions: Record<PaperSize, { width: number; height: number }> = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    Letter: { width: 215.9, height: 279.4 },
  };
  const printPageSize: Record<PaperSize, string> = { A4: 'A4', A3: 'A3', Letter: 'letter' };

  onMount(() => {
    const onResize = () => scaleDivToFit();
    window.addEventListener('resize', onResize);
    void startGame();

    return () => window.removeEventListener('resize', onResize);
  });

  let sourceWords = $state<InputWord[]>(DEFAULT_WORDS);
  let placedWords = $state<PlacedWord[]>([]);
  let letters = $state<Record<string, string>>({});
  let activeWordId = $state<number | null>(null);
  let direction = $state<Direction>('H');
  let currentRow = $state<number | null>(null);
  let currentCol = $state<number | null>(null);
  let isComposing = $state(false);
  let isGenerating = $state(true);
  let paperSize = $state<PaperSize>('A4');
  let printGridScale = $state(1);
  let printGridWidth = $state(0);
  let printGridHeight = $state(0);
  let status = $state('');
  let element: HTMLElement | null = $state(null);
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

  async function startGame(words: InputWord[] = sourceWords): Promise<void> {
    isGenerating = true;
    status = '';
    await tick();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    try {
      placedWords = generateCrossword(words);
      letters = {};
      activeWordId = placedWords[0]?.id ?? null;
      direction = placedWords[0]?.direction ?? 'H';
      currentRow = placedWords[0]?.row ?? null;
      currentCol = placedWords[0]?.col ?? null;
      status = 'Nova cruzadinha criada. Preencha as letras usando as pistas.';
    } catch {
      placedWords = [];
      status = 'Não foi possível gerar uma grade com as palavras informadas.';
    } finally {
      isGenerating = false;
      await tick();
      scaleDivToFit();
    }
  }

  async function importJson(event: Event): Promise<void> {
    isGenerating = true;
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      sourceWords = await parseWordsJsonFile(file);
      await startGame(sourceWords);
      status = `${sourceWords.length} palavras foram importadas e uma nova grade foi criada.`;
    } catch (error) {
      status = error instanceof Error ? error.message : 'Não foi possível importar o arquivo.';
    } finally {
      input.value = '';
      isGenerating = false;
    }
  }

  function selectClue(word: PlacedWord): void {
    activeWordId = word.id;
    direction = word.direction;
    currentRow = word.row;
    currentCol = word.col;
    void focusCell(word.row, word.col);
  }

  function setPrintPageRule(): void {
    const styleId = 'crossword-print-page-size';
    const style =
      document.querySelector<HTMLStyleElement>(`#${styleId}`) ?? document.createElement('style');
    style.id = styleId;
    style.textContent = `@media print { @page { size: ${printPageSize[paperSize]} portrait; margin: 10mm; } }`;
    if (!style.parentElement) document.head.append(style);
  }

  function preparePrintGrid(): void {
    if (!element) return;
    const rect = measureNaturalRect();
    const paper = paperDimensions[paperSize];
    const pixelsPerMillimeter = 96 / 25.4;
    const printableWidth = (paper.width - 20) * pixelsPerMillimeter;
    // Reserva espaço para o título e permite que as pistas fluam para páginas seguintes.
    const printableHeight = (paper.height - 55) * pixelsPerMillimeter;

    printGridScale = Math.min(1, printableWidth / rect.width, printableHeight / rect.height);
    printGridWidth = Math.ceil(rect.width * printGridScale);
    printGridHeight = Math.ceil(rect.height * printGridScale);
  }

  async function printCrossword(): Promise<void> {
    preparePrintGrid();
    setPrintPageRule();
    await tick();
    window.print();
  }

  function measureNaturalRect(): DOMRect {

    const previousTransform = (element as HTMLElement).style.transform;
    (element as HTMLElement).style.transform = '';
    const rect = (element as HTMLElement).getBoundingClientRect();
    (element as HTMLElement).style.transform = previousTransform;
    return rect;
  }

  function scaleDivToFit() {
    if (!element?.offsetWidth) {
      return;
    }
    const rect = measureNaturalRect();
    const vw = parent.clientWidth;
    const vh = parent.clientHeight || parent.clientWidth;
    // Compute scale so the element fits within viewport; don't upscale above 1
    const scaleX = vw / rect.width;
    const scaleY = vh / rect.height;
    const scale = Math.min(1, scaleX, scaleY);

    element.style.transformOrigin = 'top left';
    element.style.transform = `scale(${scale})`;
  }
</script>

<main class="app-shell">
  <header class="app-header">
    <div>
      <p class="eyebrow" lang="ja">ニャーニャー</p>
      <h1>Palavras cruzadas</h1>
      <ul class="instructions no-print">
        <li>Clique em uma letra para selecionar uma palavra.</li>
        <li>Dê duplo clique em um cruzamento para alternar entre horizontal e vertical.</li>
      </ul>
    </div>
    <p>
      <a href="/generate-file" class="no-print link">Gerar arquivo - palavras cruzadas</a>
    </p>
    <div class="actions no-print">
      <label class="file-picker">
        Importar arquivo
        <input type="file" accept="application/json,.json" onchange={importJson} />
      </label>
      <button type="button" disabled={isGenerating} onclick={async() => await startGame()}
        >Alterar layout do grid</button
      >
    </div>
    <div class="actions no-print">
      <label class="paper-size">
        Folha para impressão
        <select bind:value={paperSize} aria-label="Tamanho da folha para impressão">
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="Letter">Carta</option>
        </select>
      </label>
      <button
        type="button"
        class="secondary"
        disabled={isGenerating}
        onclick={() => void printCrossword()}>Imprimir</button
      >
    </div>
  </header>

  <p class="format-help no-print">
    Formato de entrada do documento: <code
      >[&#123; "clue": "Pista", "answer": "ひらがな ou カタカナ" &#125;]</code
    >
  </p>

  {#if status}
    <p class="status no-print" aria-live="polite">
      {status}
    </p>
  {/if}

  <section class="game-layout" aria-label="Cruzadinha e pistas" bind:this={parent}>
    <div
      class="print-grid-frame"
      style={`--print-grid-width: ${printGridWidth}px; --print-grid-height: ${printGridHeight}px; --print-grid-scale: ${printGridScale};`}
    >
      {#if isGenerating}
        <div class="ghost-crossword" role="status" aria-label="Calculando nova cruzadinha">
          {#each ghostCells as _}
            <span></span>
          {/each}
        </div>
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
                    onkeydown={(event) => keyHandler(event, (index) => moveInActiveWord(index))}
                  />
                </div>
              {/if}
            {/each}
          {/each}
        </div>
      {/if}
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
