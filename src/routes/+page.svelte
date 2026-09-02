<script lang="ts">
  import { onMount, tick } from 'svelte';
  import {
    answerCharacters,
    cellKey,
    createGrid,
    DEFAULT_WORDS,
    generateCrossword,
    isWordCorrect,
    wordCells,
  } from '$lib/crossword';
  import ClueList from '$lib/components/ClueList.svelte';
  import ControlsBar from '$lib/components/ControlsBar.svelte';
  import CrosswordGrid from '$lib/components/CrosswordGrid.svelte';
  import WordFileBuilder from '$lib/components/WordFileBuilder.svelte';
  import { normalizeKanaInput } from '$lib/input/kana';
  import { parseWordsJsonFile } from '$lib/jsonImport';
  import {
    calculatePrintGridLayout,
    setPrintPageRule,
    type PaperSize,
  } from '$lib/print/printLayout';
  import type { Direction, InputWord, PlacedWord } from '$lib/types';

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
  let element: HTMLElement | undefined = $state();
  let parent: HTMLElement | undefined;

  let grid = $derived(createGrid(placedWords));
  let activeWord = $derived(placedWords.find((word) => word.id === activeWordId) ?? null);
  let completedIds = $derived.by(
    () =>
      new Set(placedWords.filter((word) => isWordCorrect(word, letters)).map((word) => word.id)),
  );
  let printStyle = $derived(
    `--print-grid-width: ${printGridWidth}px; --print-grid-height: ${printGridHeight}px; --print-grid-scale: ${printGridScale};`,
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

  function onCompositionStart(): void {
    isComposing = true;
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

  async function startGame(words: InputWord[] = sourceWords): Promise<void> {
    isGenerating = true;
    status = '';
    await tick();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    try {
      sourceWords = words;
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
    }
  }

  function selectClue(word: PlacedWord): void {
    activeWordId = word.id;
    direction = word.direction;
    currentRow = word.row;
    currentCol = word.col;
    void focusCell(word.row, word.col);
  }

  function applyPrintPageRule(): void {
    setPrintPageRule(paperSize);
  }

  function preparePrintGrid(): void {
    if (!element) return;
    const rect = measureNaturalRect();
    const layout = calculatePrintGridLayout(rect.width, rect.height, paperSize);
    printGridScale = layout.scale;
    printGridWidth = layout.width;
    printGridHeight = layout.height;
  }

  async function printCrossword(): Promise<void> {
    preparePrintGrid();
    applyPrintPageRule();
    await tick();
    window.print();
  }

  function measureNaturalRect(): DOMRect {
    const _el = element as HTMLElement;
    const previousTransform = _el.style.transform;
    _el.style.transform = '';
    const rect = _el.getBoundingClientRect();
    _el.style.transform = previousTransform;
    return rect;
  }

  function scaleDivToFit(): void {
    if (!element?.offsetWidth || !parent) {
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

<h1>Palavras cruzadas</h1>

<p class="format-help no-print">
  Formato de entrada do documento:
  <code> [&#123; "clue": "Pista", "answer": "ひらがな ou カタカナ" &#125;] </code>
</p>

<WordFileBuilder {isGenerating} onGenerateGrid={startGame} />

<ControlsBar
  {isGenerating}
  {paperSize}
  onImport={importJson}
  onPaperSizeChange={(size) => (paperSize = size)}
  onGenerate={() => void startGame()}
  onPrint={() => void printCrossword()}
/>

<div>
  <ul class="instructions no-print">
    <li>Clique em uma letra para selecionar uma palavra.</li>
    <li>Dê duplo clique em um cruzamento para alternar entre horizontal e vertical.</li>
  </ul>
</div>
{#if status}
  <p class="status no-print" aria-live="polite">
    {status}
  </p>
{/if}
<section 
  class="game-layout" 
  aria-label="Cruzadinha e pistas" 
  bind:this={parent}
  data-no-change
>
  <CrosswordGrid
    {grid}
    {letters}
    {activeWordId}
    {currentRow}
    {currentCol}
    {isGenerating}
    {printStyle}
    onFocusCell={selectWord}
    onToggleDirection={toggleDirection}
    onInput={onLetterInput}
    {onCompositionStart}
    {onCompositionEnd}
    {onKeydown}
    bind:element
  />
  <ClueList 
    words={placedWords} 
    {activeWordId} 
    {completedIds} 
    onSelect={selectClue} 
  />
</section>
