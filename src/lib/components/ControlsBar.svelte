<script lang="ts">
  import type { PaperSize } from '$lib/print/printLayout';

  interface Props {
    isGenerating: boolean;
    paperSize: PaperSize;
    onImport: (event: Event) => Promise<void>;
    onPaperSizeChange: (paperSize: PaperSize) => void;
    onGenerate: () => void;
    onPrint: () => void;
  }

  let { isGenerating, paperSize, onImport, onPaperSizeChange, onGenerate, onPrint }: Props = $props();
</script>

<div class="actions no-print">
  <label class="file-picker">
    Importar arquivo
    <input type="file" accept="application/json,.json" onchange={onImport} />
  </label>
  <label class="paper-size">
    Folha para impressão
    <select
      value={paperSize}
      aria-label="Tamanho da folha para impressão"
      onchange={(event) => onPaperSizeChange((event.currentTarget as HTMLSelectElement).value as PaperSize)}
    >
      <option value="A4">A4</option>
      <option value="A3">A3</option>
      <option value="Letter">Carta</option>
    </select>
  </label>
  <button type="button" disabled={isGenerating} onclick={onGenerate}>Alterar layout do grid</button>
  <button type="button" class="secondary" disabled={isGenerating} onclick={onPrint}>Imprimir</button>
</div>
