<script lang="ts">
  import CluesList from '$lib/components/CluesList.svelte';
  import CrosswordGrid from '$lib/components/CrosswordGrid.svelte';
  import FileUploader from '$lib/components/FileUploader.svelte';
  import type { Crossword, Word } from '$lib/utils/types';
  import { generateCrossword } from '$lib/utils/crosswordGenerator';

  let words: Word[] = $state([]);
  let crossword: Crossword | null = $state(null);
  let answers: { [key: string]: string } = $state({});
  let showAnswers = $state(false);

  function handleWordsLoaded(event: Word[]) {
    words = $state.snapshot(event);
    generateNewCrossword();
  }

  function generateNewCrossword() {
    if (words.length > 0) {
      crossword = generateCrossword(
        $state.snapshot(words)
      );
      answers = {};
    }
  }

  function handleCellChange(event: { row: number; col: number; value: string }) {
    const { row, col, value } = event;
    if (crossword) {
      const key = `${row}-${col}`;
      answers[key] = value.toUpperCase();
    }
  }

  function toggleAnswers() {
    showAnswers = !showAnswers;
  }

  function resetCrossword() {
    answers = {};
  }
</script>

<div class="container">
  <header>
    <h1>🎯 Crossword Generator</h1>
    <p>Generate crosswords in any language from JSON files</p>
  </header>

  <main>
    <div class="sidebar">
      <FileUploader onwordsLoaded={handleWordsLoaded} />
      
      {#if words.length > 0}
        <div class="controls">
          <button onclick={generateNewCrossword} class="btn btn-primary">
            🔄 Generate New
          </button>
          <button onclick={resetCrossword} class="btn btn-secondary">
            ↺ Reset
          </button>
          <button onclick={toggleAnswers} class="btn btn-secondary">
            {showAnswers ? '👁 Hide Answers' : '👁 Show Answers'}
          </button>
        </div>
      {/if}

      {#if crossword}
        <CluesList clues={crossword.clues} />
      {/if}
    </div>

    <div class="puzzle-area">
      {#if crossword}
        <CrosswordGrid
          grid={crossword.grid}
          oncellChange={handleCellChange}
          {answers}
          {showAnswers}
        />
      {:else if words.length === 0}
        <div class="placeholder">
          <p>Upload a JSON file with words and tips to get started!</p>
        </div>
      {/if}
    </div>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .container {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background: rgba(0, 0, 0, 0.3);
    color: white;
    padding: 2rem 1rem;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
  }

  header p {
    margin: 0;
    opacity: 0.9;
  }

  main {
    display: flex;
    flex: 1;
    gap: 2rem;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .sidebar {
    flex: 0 0 320px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .puzzle-area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .btn-secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-secondary:hover {
    background: #f0f4ff;
    transform: translateY(-2px);
  }

  .placeholder {
    text-align: center;
    color: #999;
    font-size: 1.1rem;
  }

  @media (max-width: 1024px) {
    main {
      flex-direction: column;
    }

    .sidebar {
      flex: 0 0 auto;
    }

    .puzzle-area {
      min-height: 500px;
    }
  }
</style>
