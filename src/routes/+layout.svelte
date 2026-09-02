<script lang="ts">
    import { page } from '$app/state';
  import '../app.css';

  let { children } = $props();
  const routes = [
    {
      path: '/',
      title: 'Palavras Cruzadas'
    },
    {
      path: '/how-to-use',
      title: 'Como utilizar?'
    },
  ] 
</script>
<header class="wrapper">
  <p class="eyebrow" lang="ja">ニャーニャー</p>
  <nav class="no-print">
    <ul role="list">
      {#each routes as route}
        <li>
          <a 
            class="link" 
            href={route.path}
            aria-current={page.url.pathname === route.path ? 'page': null}
          >
            {route.title}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</header>
<main class="wrapper">
  {@render children()}
</main>
