<script lang="ts">
  import { onMount } from 'svelte';
  import TournamentBracket from '$lib/components/TournamentBracket.svelte';
  import { parseCsv } from '$lib/utils/csvParser.js';
  import { generateBracket } from '$lib/utils/bracketGenerator.js';
  import type { Tournament } from '$lib/types/Task.js';

  let tournament: Tournament = {
    tasks: [],
    rounds: [],
    winner: null
  };
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      // Load tasks from CSV
      const response = await fetch('/new_tasks.csv');
const csvContent = await response.text();
const tasks = parseCsv(csvContent);
      console.log('Loaded tasks:', tasks);
      
      // Generate tournament bracket
      tournament = generateBracket(tasks);
      console.log('Generated tournament:', tournament);
      
      loading = false;
    } catch (err) {
      console.error('Error loading tournament:', err);
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      loading = false;
    }
  });

  function handleTournamentUpdate(updatedTournament: Tournament) {
    tournament = updatedTournament;
  }
</script>

<svelte:head>
  <title>Task Battle Tournament</title>
  <meta name="description" content="A tournament-style task battle application" />
</svelte:head>

<main>
  {#if loading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading tournament data...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <h2>❌ Error Loading Tournament</h2>
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>Try Again</button>
    </div>
  {:else}
    <TournamentBracket {tournament} onTournamentUpdate={handleTournamentUpdate} />
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
    background: white;
    border-radius: 12px;
    padding: 40px;
    margin: 0 auto;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-container p {
    color: #6c757d;
    font-size: 1.1em;
    margin: 0;
  }

  .error-container h2 {
    color: #dc3545;
    margin: 0 0 15px 0;
  }

  .error-container p {
    color: #6c757d;
    margin: 0 0 20px 0;
  }

  .error-container button {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    transition: background 0.2s;
  }

  .error-container button:hover {
    background: #0056b3;
  }

  /* Global styles */
  :global(body) {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  :global(*) {
    box-sizing: border-box;
  }
</style>
