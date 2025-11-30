<script lang="ts">
  import { onMount } from 'svelte';
  import TournamentBracket from '$lib/components/TournamentBracket.svelte';
  import MiniGame from '$lib/components/MiniGame.svelte';
  import { parseCsv } from '$lib/utils/csvParser.js';
  import { generateBracket } from '$lib/utils/bracketGenerator.js';
  import type { Tournament, Task } from '$lib/types/Task.js';

  let tournament: Tournament = {
    tasks: [],
    rounds: [],
    winner: null
  };
  let loading = true;
  let error = '';

  onMount(() => {
    try {
      const saved = localStorage.getItem('taskBattleResults');
      let tasks = [];
      if (saved) {
        tasks = JSON.parse(saved);
        console.log('Loaded tasks from localStorage:', tasks);
      } else {
        tasks = [];
        console.log('No tasks found in localStorage, starting empty tournament.');
      }
      tournament = generateBracket(tasks);
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

  let miniGameVisible = false;
  let miniGameTasks = { task1: null as Task | null, task2: null as Task | null };

  function startMiniGame(task1: Task, task2: Task) {
    miniGameTasks = { task1, task2 };
    miniGameVisible = true;
  }

  import { advanceWinner } from '$lib/utils/bracketGenerator.js';

  function handleWinnerSelected(event: CustomEvent<{ winner: Task }>) {
    const { winner } = event.detail;
    // Find the current match id for the mini game
    let matchId = '';
    for (const round of tournament.rounds) {
      for (const match of round.matches) {
        if (
          match.task1 && miniGameTasks.task1 && match.task1.id === miniGameTasks.task1.id &&
          match.task2 && miniGameTasks.task2 && match.task2.id === miniGameTasks.task2.id
        ) {
          matchId = match.id;
          break;
        }
      }
      if (matchId) break;
    }
    if (matchId) {
      tournament = advanceWinner(tournament, matchId, winner);
    }

    // Add battle animation
    const task1Element = document.querySelector('.task1') as HTMLElement;
    const task2Element = document.querySelector('.task2') as HTMLElement;

    if (task1Element && task2Element) {
      task1Element.style.transition = 'transform 1s ease-in-out';
      task2Element.style.transition = 'transform 1s ease-in-out, background-color 1s ease-in-out';

      task1Element.style.transform = 'translateX(100px)';
      task2Element.style.transform = 'translateY(100px)';
      task2Element.style.backgroundColor = 'red';

      setTimeout(() => {
        task1Element.style.transform = '';
        task2Element.style.transform = '';
        task2Element.style.backgroundColor = '';
      }, 1000);
    }

    miniGameVisible = false;
  }
</script>

<svelte:head>
  <title>Task Battle Tournament</title>
  <meta name="description" content="A tournament-style task battle application" />
</svelte:head>

<main>
  <button
    style="margin-bottom: 24px; padding: 10px 20px; font-size: 1em; border-radius: 8px; background: #007bff; color: white; border: none; cursor: pointer;"
    on:click={() => {
      const sampleTasks = [
        { id: 'a', name: 'Task A', description: 'Debug task A' },
        { id: 'b', name: 'Task B', description: 'Debug task B' },
        { id: 'c', name: 'Task C', description: 'Debug task C' },
        { id: 'd', name: 'Task D', description: 'Debug task D' },
        { id: 'e', name: 'Task E', description: 'Debug task E' }
      ];
      localStorage.setItem('taskBattleResults', JSON.stringify(sampleTasks));
      window.location.reload();
    }}
  >
    Fill Debug Tasks
  </button>
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
    {#if miniGameVisible}
      <MiniGame task1={miniGameTasks.task1!} task2={miniGameTasks.task2!} on:winnerSelected={handleWinnerSelected} />
    {:else}
      <TournamentBracket {tournament} onTournamentUpdate={handleTournamentUpdate} startMiniGame={(task1: Task | null, task2: Task | null) => startMiniGame(task1!, task2!)} />
    {/if}
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
