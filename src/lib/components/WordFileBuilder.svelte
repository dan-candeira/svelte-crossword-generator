<script lang="ts">
  import { isKanaAnswer, normalizeKanaAnswer } from '$lib/input/kana';
  import type { InputWord } from '$lib/types';

  interface BuilderItem extends InputWord {
    id: string;
  }

  interface Props {
    isGenerating: boolean;
    onGenerateGrid: (words: InputWord[]) => Promise<void>;
  }

  let { isGenerating, onGenerateGrid }: Props = $props();
  let answer = $state('');
  let clue = $state('');
  let errorMessage = $state('');
  let items = $state<BuilderItem[]>([]);

  function wordsForGrid(): InputWord[] {
    return items.map(({ clue: itemClue, answer: itemAnswer }) => ({
      clue: itemClue,
      answer: itemAnswer,
    }));
  }

  function addWord(event: SubmitEvent): void {
    event.preventDefault();
    const normalizedAnswer = normalizeKanaAnswer(answer);

    if (!clue.trim()) {
      errorMessage = 'Informe uma pista para a palavra.';
      return;
    }
    if (!isKanaAnswer(normalizedAnswer)) {
      errorMessage = 'A resposta deve conter somente hiragana ou katakana.';
      return;
    }

    items.push({ id: crypto.randomUUID(), clue: clue.trim(), answer: normalizedAnswer });
    answer = '';
    clue = '';
    errorMessage = '';
  }

  function removeWord(id: string): void {
    items = items.filter((item) => item.id !== id);
  }

  function downloadJson(): void {
    const blob = new Blob([JSON.stringify(wordsForGrid(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `palavras-cruzadas-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function generateGrid(): Promise<void> {
    if (!items.length) {
      errorMessage = 'Adicione ao menos uma palavra antes de gerar a grid.';
      return;
    }

    errorMessage = '';
    await onGenerateGrid(wordsForGrid());
  }
</script>

<section class="word-builder no-print" aria-labelledby="word-builder-title">
  <div class="word-builder-header">
    <div>
      <h2 id="word-builder-title">Criar arquivo de palavras</h2>
      <p>Adicione pistas e respostas em hiragana ou katakana.</p>
    </div>
  </div>

  <form class="word-builder-form" onsubmit={addWord}>
    <label>
      Resposta
      <input bind:value={answer} type="text" lang="ja" autocomplete="off" placeholder="ねこ ou ゲーム" />
    </label>
    <label>
      Pista
      <input bind:value={clue} type="text" autocomplete="off" placeholder="Gato em japonês" />
    </label>
    <button type="submit" disabled={isGenerating}>Adicionar</button>
  </form>

  {#if errorMessage}
    <p class="builder-error" role="alert">{errorMessage}</p>
  {/if}

  {#if items.length > 0}
    <ul class="word-builder-list">
      {#each items as item (item.id)}
        <li>
          <span lang="ja">{item.answer}</span>
          <span>{item.clue}</span>
          <button type="button" class="icon-button" data-icon onclick={() => removeWord(item.id)} aria-label={`Remover ${item.answer}`}>×</button>
        </li>
      {/each}
    </ul>

    <div class="word-builder-actions">
      <button type="button" class="secondary" onclick={downloadJson}>Baixar JSON</button>
      <button type="button" disabled={isGenerating} onclick={() => void generateGrid()}>Gerar grid com estas palavras</button>
    </div>
  {:else}
    <p class="builder-empty">Nenhuma palavra adicionada.</p>
  {/if}
</section>
