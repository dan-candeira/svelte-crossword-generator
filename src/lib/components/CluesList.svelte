<script lang="ts">
	import type { Clue } from '$lib/utils/types';
	import { SvelteSet } from 'svelte/reactivity';

	let { clues = [] }: { clues: Clue[] } = $props();

	let expandedClues = new SvelteSet<string>();

	function toggleClue(id: string) {
		if (expandedClues.has(id)) {
			expandedClues.delete(id);
		} else {
			expandedClues.add(id);
		}
	}

	const acrossClues = $derived(
		clues.filter((c: Partial<{ direction: 'across' | 'down' }>) => c.direction === 'across')
	);
	const downClues = $derived(
		clues.filter((c: Partial<{ direction: 'across' | 'down' }>) => c.direction === 'down')
	);
</script>

<div class="clues-box">
	<h3>📝 Clues</h3>

	{#if acrossClues.length > 0}
		<div class="clues-section">
			<h4>Across</h4>
			<div class="clues-list">
				{#each acrossClues as clue (clue.number)}
					<div class="clue-item">
						<button
							class="clue-toggle"
							onclick={() => toggleClue(`across-${clue.number}`)}
							class:expanded={expandedClues.has(`across-${clue.number}`)}
						>
							<span class="number">{clue.number}</span>
							<span class="text">{clue.text}</span>
							<span class="toggle-icon">▼</span>
						</button>
						{#if expandedClues.has(`across-${clue.number}`)}
							<div class="clue-answer">Answer: {clue.answer}</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if downClues.length > 0}
		<div class="clues-section">
			<h4>Down</h4>
			<div class="clues-list">
				{#each downClues as clue (clue.number)}
					<div class="clue-item">
						<button
							class="clue-toggle"
							onclick={() => toggleClue(`down-${clue.number}`)}
							class:expanded={expandedClues.has(`down-${clue.number}`)}
						>
							<span class="number">{clue.number}</span>
							<span class="text">{clue.text}</span>
							<span class="toggle-icon">▼</span>
						</button>
						{#if expandedClues.has(`down-${clue.number}`)}
							<div class="clue-answer">Answer: {clue.answer}</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.clues-box {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		max-height: 600px;
		overflow-y: auto;
	}

	h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	h4 {
		margin: 1rem 0 0.5rem 0;
		color: #666;
		font-size: 0.95rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	h4:first-of-type {
		margin-top: 0;
	}

	.clues-section {
		margin-bottom: 1rem;
	}

	.clues-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.clue-item {
		border: 1px solid #eee;
		border-radius: 4px;
		overflow: hidden;
	}

	.clue-toggle {
		width: 100%;
		padding: 0.75rem;
		border: none;
		background: #f9f9f9;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		transition: background 0.2s ease;
		text-align: left;
	}

	.clue-toggle:hover {
		background: #f0f0f0;
	}

	.clue-toggle.expanded {
		background: #e8f4f8;
		border-bottom: 1px solid #ddd;
	}

	.number {
		font-weight: bold;
		color: #667eea;
		min-width: 25px;
	}

	.text {
		flex: 1;
		color: #333;
	}

	.toggle-icon {
		color: #999;
		font-size: 0.8rem;
		transition: transform 0.2s ease;
	}

	.clue-toggle.expanded .toggle-icon {
		transform: rotateZ(180deg);
	}

	.clue-answer {
		padding: 0.75rem;
		background: #f0f0f0;
		color: #28a745;
		font-weight: bold;
		font-size: 0.9rem;
		border-top: 1px solid #ddd;
	}
</style>
