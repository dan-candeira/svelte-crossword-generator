# Plano de refatoração da estrutura

## Objetivo

Separar a aplicação por responsabilidade, reduzindo o acoplamento de `+page.svelte` e do algoritmo de geração, sem alterar o comportamento da cruzadinha.

## Diagnóstico

- A página principal acumulava estado, eventos de teclado, IME kana, renderização, loading e impressão.
- O arquivo `crossword.ts` concentrava coordenadas, validação, scoring, posicionamento e criação da matriz.
- Tipos de palavras de entrada e palavras usadas no gerador de arquivo não estavam separados.
- A lógica de kana e a lógica de impressão não tinham módulos próprios.

## Estrutura alvo

```text
src/lib/
├─ components/
│  ├─ ControlsBar.svelte
│  ├─ CrosswordGrid.svelte
│  ├─ ClueList.svelte
│  └─ GhostCrossword.svelte
├─ crossword/
│  ├─ constants.ts
│  ├─ coordinates.ts
│  ├─ placement.ts
│  ├─ grid.ts
│  └─ index.ts
├─ input/
│  └─ kana.ts
├─ print/
│  └─ printLayout.ts
├─ jsonImport.ts
└─ types.ts
```

## Etapas

### 1. Corrigir os contratos de dados

- Manter `InputWord` somente com `clue` e `answer`.
- Manter os metadados temporários de criação de arquivo encapsulados no componente, sem expô-los no contrato JSON.
- Manter `PlacedWord` como extensão de `InputWord` com posição, direção e numeração.

### 2. Extrair tratamento kana

- Mover normalização e validação de hiragana/katakana para `lib/input/kana.ts`.
- Manter `jsonImport.ts` dedicado a leitura e validação estrutural do JSON.
- Preservar NFC, dakuten, handakuten, sokuon e prolongador katakana.

### 3. Dividir o algoritmo de cruzadinha

- `coordinates.ts`: caracteres kana, células e chaves de coordenadas.
- `placement.ts`: colisões, cruzamentos, scoring, múltiplas tentativas e posicionamento compacto.
- `grid.ts`: matriz para renderização e validação de respostas.
- `index.ts`: API pública estável para a interface e testes.

### 4. Extrair componentes de interface

- `ControlsBar`: importação JSON, tamanho de papel, regeneração e impressão.
- `CrosswordGrid`: grade, eventos de input/foco e escala visual.
- `GhostCrossword`: placeholder animado durante cálculo.
- `ClueList`: pistas horizontais/verticais, seleção e conclusão.

### 5. Extrair impressão

- Centralizar tamanhos de papel, cálculo de escala e regra CSS `@page` em `printLayout.ts`.
- A página apenas seleciona o tamanho e chama o utilitário antes de imprimir.

### 6. Simplificar a página principal

- Manter em `+page.svelte` somente o estado da partida e orquestração entre componentes.
- Preservar regras de foco: setas, Enter condicionado, clique e Backspace.

### 7. Validar

Executar após instalar dependências com Node.js `>=18.18.0`:

```powershell
npm install
npm run format
npm run lint
npm run check
npm run test
npm run build
```

## Critérios de aceite

- O comportamento atual do jogo é mantido.
- Os arquivos ficam menores e coesos.
- O algoritmo preserva a geração compacta e os blocos pretos entre palavras isoladas.
- Importação JSON e IME kana continuam funcionando.
- Impressão A4/A3/Carta continua evitando overflow.
