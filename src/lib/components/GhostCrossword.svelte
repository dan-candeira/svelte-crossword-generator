<script lang="ts">
  const cells = Array.from({ length: 64 });
</script>

<div class="ghost-crossword" role="status" aria-label="Calculando nova cruzadinha">
  {#each cells as _}
    <span></span>
  {/each}
</div>
