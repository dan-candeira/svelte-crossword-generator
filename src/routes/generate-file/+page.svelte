<script lang="ts">
    import type { InputWords } from '$lib/types'

	let answer = $state('');
	let clue = $state('');
	let items: InputWords = $state([]);

	function handleRegister(event: SubmitEvent) {
        event.preventDefault();

		if (answer.trim() && clue.trim()) {
			items = [
				...items,
				{
                    wordId: new Date(),
					answer: answer.trim(),
					clue: clue.trim(),
					createdAt: new Date()
				}
			];
			answer = '';
			clue = '';
		}
	}

	function handleDelete(id: string) {
		items = items.filter((item) => item.wordId.toString() !== id);
	}

	function downloadJSON() {
		const dataStr = JSON.stringify(items, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `clues-and-answers-${Date.now()}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
</script>

<main>
	<div class="container">
    <header class="app-header">
    <div>
      <p class="eyebrow" lang="ja">ニャーニャー</p>
      <h1>Gerar arquivo - Palavras cruzadas</h1>
    </div>
    <p>
        <a href="/" class="link">Retornar para as palavras cruzadas</a>
    </p>
  </header>
		

		
		<section class="form-section">
			<h2>Adicione uma nova palavra</h2>
			<form onsubmit={handleRegister}>
				<div class="form-group">
					<label for="answer">Palavra</label>
					<input
						id="answer"
						type="text"
						placeholder="Enter the answer"
						bind:value={answer}
					/>
				</div>

				<div class="form-group">
					<label for="clue">Pista</label>
					<input
						id="clue"
						type="text"
						placeholder="Enter the clue"
						bind:value={clue}
					/>
				</div>

				<button type="submit" class="btn-register">Adicionar</button>
			</form>
		</section>

		<!-- List Section -->
		<section class="list-section">
			<div class="list-header">
				<h2>Palavras ({items.length})</h2>
				{#if items.length > 0}
					<button class="btn-download" data-icon  onclick={downloadJSON}>
						📥 Download
					</button>
				{/if}
			</div>

			{#if items.length === 0}
				<div class="empty-state">
					<p>Não há palavras registradas ainda. Adicione uma utilizando o form acima!</p>
				</div>
			{:else}
				<ul class="list-container">
					{#each items as item (item.wordId.toString())}
						<li class="list-item">
							<div class="item-content">
								<div class="item-row">
									<span class="label">Palavra:</span>
									<span class="value">{item.answer}</span>
								</div>
								<div class="item-row">
									<span class="label">Pista:</span>
									<span class="value">{item.clue}</span>
								</div>
							</div>
							<button
								class="btn-delete"
                                data-icon
								onclick={() => handleDelete(item.wordId.toString())}
								title="Deletar palavra"
							>
								🗑️
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* Form Section */
	.form-section {
		background: #f9f9f9;
		padding: 2rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	label {
		font-weight: 600;
		color: #333;
		font-size: 0.95rem;
	}

	input {
		padding: 0.75rem;
		border: 2px solid #ddd;
		font-size: 1rem;
		transition: border-color 0.3s ease;
		font-family: inherit;
	}

	input:focus {
		outline: none;
		border-color: #4a90e2;
	}

	input::placeholder {
		color: #999;
	}

	.btn-download {
		background-color: #27ae60;
		color: white;
	}

	.btn-download:hover {
		background-color: #229954;
		transform: translateY(-2px);
	}

	.btn-delete {
		background-color: #e74c3c;
		color: white;
		padding: 0.5rem 0.75rem;
		font-size: 0.9rem;
		align-self: flex-start;
        flex-grow: 0;
        width: 50px;
	}

	.btn-delete:hover {
		background-color: #c0392b;
	}

	/* List Section */
	.list-section {
		background: #f9f9f9;
		padding: 2rem;
	}

	.list-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.list-header h2 {
		margin: 0;
	}

	.empty-state {
		text-align: center;
		padding: 2rem 1rem;
		color: #999;
		font-style: italic;
	}

	.list-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.list-item {
		background: white;
		border: 1px solid #ddd;
		padding: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
        list-style-type: none;
	}

	.list-item:hover {
		border-color: #4a90e2;
	}

	.item-content {
		flex: 1;
		gap: 0.75rem;
	}

	.item-row {
		display: flex;
		gap: 0.75rem;
	}

	.item-row.timestamp {
		opacity: 0.7;
		font-size: 0.9rem;
	}

	.label {
		font-weight: 600;
		color: #666;
		min-width: 70px;
	}

	.value {
		color: #333;
		flex: 1;
		word-break: break-word;
	}

	/* Responsive */
	@media (max-width: 640px) {
		main {
			padding: 1rem 0.5rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.list-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.list-item {
			flex-direction: column;
		}

		.btn-download {
			width: 100%;
		}

		.btn-register {
			width: 100%;
		}
	}
</style>
