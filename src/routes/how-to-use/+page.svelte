<svelte:head>
  <title>Como utilizar | ニャーニャー</title>
  <meta
    name="description"
    content="Instruções para criar, gerar, reorganizar e imprimir palavras cruzadas."
  />
</svelte:head>

<h1>Como utilizar</h1>
<p>Crie sua lista de palavras, gere uma cruzadinha e imprima no tamanho de folha desejado.</p>
<section>
  <h2>1. Criar um arquivo de palavras</h2>
  <p>
    Adicione uma resposta e sua pista. Para cada item, use uma resposta composta apenas por
    hiragana ou katakana.
  </p>
  <p>
    Depois de adicionar todas as palavras, use <strong>Baixar JSON</strong> para salvar a lista.
  </p>
  <pre>
    <code
      >[
      &#123; "clue": "Gato em japonês", "answer": "ねこ" &#125;,
      &#123; "clue": "Jogo em japonês", "answer": "ゲーム" &#125;
    ]</code
    >
  </pre>
  <p>
    São válidos: <code>ねこ</code>, <code>がっこう</code>, <code>パン</code> e
    <code>コーヒー</code>. Romaji e kanji não são aceitos.
  </p>
</section>

<section>
  <h2>2. Gerar uma nova grid</h2>
  <p>
    Use <strong>Importar arquivo</strong> para selecionar um JSON compatível. A aplicação exibe um placeholder
    enquanto calcula as posições das palavras.
  </p>
  <p>
    O algoritmo tenta maximizar cruzamentos, reduzir o espaço ocupado e separar palavras que não
    podem cruzar com células pretas.
  </p>
</section>

<section>
  <h2>3. Alterar o layout da grid</h2>
  <p>
    Clique em <strong>Alterar layout do grid</strong> para calcular uma nova disposição usando a mesma
    lista de palavras e pistas.
  </p>
  <p>
    As respostas não mudam; apenas as posições, direções e cruzamentos podem ser reorganizados.
  </p>
</section>

<section>
  <h2>4. Imprimir</h2>
  <p>
    Antes de clicar em <strong>Imprimir</strong>, escolha o tamanho da folha: <strong>A4</strong>,
    <strong>A3</strong>
    ou <strong>Carta</strong>.
  </p>
  <p>
    A aplicação mede a grid e calcula uma escala para mantê-la dentro da área útil da folha,
    evitando overflow. As pistas podem continuar em páginas seguintes quando necessário.
  </p>
</section>
