<script lang="ts">
  import type { PlacedWord } from '$lib/types';

  const clueGroups = [
    { direction: 'H' as const, title: 'Horizontais' },
    { direction: 'V' as const, title: 'Verticais' },
  ];

  interface Props {
    words: PlacedWord[];
    activeWordId: number | null;
    completedIds: Set<number>;
    onSelect: (word: PlacedWord) => void;
  }

  let { words, activeWordId, completedIds, onSelect }: Props = $props();
</script>

<aside class="clues" aria-label="Pistas">
  {#each clueGroups as group}
    <section data-no-change>
      <h2>{group.title}</h2>
      <ol>
        {#each words.filter((word) => word.direction === group.direction) as word (word.id)}
          <li
            value={word.number}
            class:active-clue={word.id === activeWordId}
            class:completed-clue={completedIds.has(word.id)}
          >
            <button type="button" onclick={() => onSelect(word)}>{word.clue}</button>
          </li>
        {/each}
      </ol>
    </section>
  {/each}
</aside>
