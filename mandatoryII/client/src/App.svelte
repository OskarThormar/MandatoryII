<script>
  import LoginComponent from './components/LoginSignout/LoginComponent.svelte';
</script>

<main>
  <LoginComponent />

  {#if false} <h2>Dette er beskyttet indhold!</h2>
      <p>Kun logget ind brugere kan se dette.</p>
  {:else}
      <p>Log ind for at se beskyttet indhold.</p>
  {/if}
</main>