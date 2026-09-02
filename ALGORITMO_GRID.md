# Algoritmo de geração do grid

O algoritmo está implementado em `src/lib/crossword.ts` e gera posições dinâmicas para palavras em hiragana e katakana.

## 1. Entrada

Cada palavra possui somente uma pista e uma resposta:

```ts
{ clue: 'Gato em japonês', answer: 'ねこ' }
```

O algoritmo gera `row`, `col`, `direction`, `id` e `number`.

## 2. Caracteres kana

`answerCharacters(answer)` normaliza a resposta em NFC e a divide em caracteres. Cada caractere ocupa uma célula do grid.

```ts
answerCharacters('がっこう');
// ['が', 'っ', 'こ', 'う']
```

Assim, dakuten, handakuten, sokuon e o prolongador katakana (`ー`) são preservados.

## 3. Células de uma palavra

`wordCells(word)` transforma uma palavra posicionada em células com coordenadas e letra.

Uma palavra horizontal `ねこ` iniciada em `row: 2`, `col: 3` ocupa:

```ts
[
  { row: 2, col: 3, letter: 'ね' },
  { row: 2, col: 4, letter: 'こ' }
]
```

## 4. Ordem de posicionamento

`orderWordsForPlacement` prioriza palavras que:

1. Compartilham mais caracteres com as demais;
2. São maiores.

Isso aumenta a chance de criar um núcleo com cruzamentos antes de posicionar palavras isoladas.

## 5. Cruzamentos candidatos

`crossingCandidates` procura caracteres iguais entre uma palavra nova e palavras já posicionadas.

Quando encontra uma letra igual, tenta a palavra nova na direção oposta:

- palavra existente horizontal: candidata vertical;
- palavra existente vertical: candidata horizontal.

Somente caracteres idênticos cruzam. Por exemplo, `ね` cruza com `ね`, mas não com `ネ`.

## 6. Validação de posição

`canPlace` rejeita:

- letras diferentes na mesma célula;
- sobreposições inválidas;
- palavras isoladas que cruzem ou encostem em outras.

Um cruzamento só é válido quando duas palavras em direções opostas ocupam a mesma célula com a mesma letra.

## 7. Palavras sem cruzamento

Quando não há cruzamento possível, `compactIsolatedCandidates` varre posições próximas ao grid atual, nas duas direções.

Ela aceita apenas posições que deixam pelo menos uma célula vazia entre palavras não conectadas. Na interface, essas células vazias são renderizadas como:

```html
<div class="cell black"></div>
```

## 8. Pontuação dos candidatos

`candidateScore` e `layoutScore` favorecem:

1. Menor área total do grid;
2. Grid mais proporcional;
3. Mais cruzamentos;
4. Menos palavras isoladas.

Quanto menor a pontuação, melhor o layout.

## 9. Múltiplas tentativas

`generateCrossword` gera diversos layouts completos:

```ts
const attempts = Math.min(48, Math.max(16, input.length * 4));
```

Cada tentativa pode usar uma ordem e direção inicial diferentes. Ao final, o algoritmo mantém o layout com menor `layoutScore`.

## 10. Validação final e normalização

`validateGridBeforeRender` revisa o resultado antes da renderização. Se encontrar colisões inválidas, tenta reposicionar a palavra por cruzamento ou como isolada.

Depois, `normalizeLayout` desloca todas as coordenadas para que o menor `row` e `col` sejam zero.

## 11. Matriz para renderização

`createGrid` cria a matriz final. Células com palavras geram inputs; células sem palavras geram blocos pretos.

Fluxo resumido:

```txt
Recebe palavras
→ divide respostas em kana
→ ordena por potencial de cruzamento
→ cria múltiplos layouts
→ tenta cruzamentos
→ encaixa isoladas com separação
→ pontua layouts
→ escolhe o mais compacto
→ normaliza posições
→ cria matriz para renderização
```
