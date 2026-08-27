<script lang="ts">
  import type { Word } from '$lib/utils/types';


  let { onwordsLoaded }: {
    onwordsLoaded: (event: Word[]) => void;
  } = $props();

  let fileName = $state('');

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    fileName = file.name;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
          alert('JSON must be an array of words');
          return;
        }

        const words: Word[] = data.map((item) => {
          if (typeof item === 'object' && 'text' in item && 'tip' in item) {
            return {
              text: String(item.text).trim().toUpperCase(),
              tip: String(item.tip),
            };
          }
          throw new Error('Invalid word format');
        });

        onwordsLoaded(words);
      } catch (error) {
        alert('Error parsing JSON: ' + (error as Error).message);
        fileName = '';
      }
    };

    reader.readAsText(file);
  }
</script>

<div class="uploader">
  <h3>📁 Load Crossword Words</h3>
  <label class="file-input-wrapper">
    <input type="file" accept=".json" onchange={handleFileUpload} />
    <span class="file-input-label">Choose JSON File</span>
  </label>
  {#if fileName}
    <p class="file-name">✓ {fileName}</p>
  {/if}
  <div class="format-info">
    <p><strong>JSON Format:</strong></p>
    <pre><code>{`[
  {
    "text": "WORD",
    "tip": "Clue for the word"
  },
  {
    "text": "ANOTHER",
    "tip": "Another clue"
  }
]`}</code></pre>
  </div>
</div>

<style>
  .uploader {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.1rem;
  }

  .file-input-wrapper {
    display: block;
    position: relative;
    cursor: pointer;
  }

  input[type='file'] {
    display: none;
  }

  .file-input-label {
    display: block;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .file-input-wrapper:hover .file-input-label {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .file-name {
    margin: 0.75rem 0 0 0;
    color: #28a745;
    font-size: 0.9rem;
  }

  .format-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .format-info p {
    margin: 0 0 0.5rem 0;
    color: #666;
    font-size: 0.85rem;
  }

  pre {
    background: #f5f5f5;
    border-radius: 4px;
    padding: 0.75rem;
    overflow-x: auto;
    font-size: 0.8rem;
    margin: 0;
  }

  code {
    font-family: 'Courier New', monospace;
    color: #333;
  }
</style>
