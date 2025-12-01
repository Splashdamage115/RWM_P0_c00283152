<script lang="ts">
  import { onMount } from 'svelte';
  import TournamentBracket from './TournamentBracket.svelte';
  import MiniGame from './MiniGame.svelte';
  import { generateBracket, advanceWinner } from '../utils/bracketGenerator.js';
  import type { Tournament, Task } from '../types/Task.js';

  // Props that can be passed from parent component
  export let tasks: Task[] = [];
  export let showHeader: boolean = true;
  export let onTournamentComplete: (winner: Task) => void = () => {};
  export let onGoBack: () => void = () => history.back();

  let tournament: Tournament = {
    tasks: [],
    rounds: [],
    winner: null
  };
  let loading = true;
  let error = '';

  onMount(() => {
    try {
      // Use provided tasks or load from localStorage
      let tournamentTasks = tasks;
      if (tournamentTasks.length === 0) {
        const saved = localStorage.getItem('taskBattleResults');
        if (saved) {
          tournamentTasks = JSON.parse(saved);
          console.log('Loaded tasks from localStorage:', tournamentTasks);
        }
      }
      
      tournament = generateBracket(tournamentTasks);
      loading = false;
    } catch (err) {
      console.error('Error loading tournament:', err);
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      loading = false;
    }
  });

  // Watch for tournament winner and call callback
  $: if (tournament.winner) {
    onTournamentComplete(tournament.winner);
  }

  function handleTournamentUpdate(updatedTournament: Tournament) {
    tournament = updatedTournament;
  }

  let miniGameVisible = false;
  let miniGameTasks = { task1: null as Task | null, task2: null as Task | null };

  function startMiniGame(task1: Task, task2: Task) {
    miniGameTasks = { task1, task2 };
    miniGameVisible = true;
  }

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

    miniGameVisible = false;
  }

  function handleBackFromMiniGame() {
    miniGameVisible = false;
  }
</script>

<main class="task-battle-tournament">
  {#if !miniGameVisible && showHeader}
    <header class="tournament-header">
      <div class="header-content">
        <h1 class="tournament-title">🏆 Task Battle Tournament</h1>
        <p class="tournament-subtitle">Battle through tasks to determine the ultimate priority</p>
        <div class="header-actions">
          {#if tournament.winner}
            <button
              class="back-button"
              on:click={onGoBack}
            >
              ← Go Back
            </button>
            <div class="tournament-status">
              <span class="status-badge completed">Tournament Complete</span>
            </div>
          {:else if tournament.rounds.length > 0}
            <div class="tournament-status">
              <span class="status-badge active">Tournament Active</span>
            </div>
          {/if}
        </div>
      </div>
    </header>
  {/if}
  
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
      <MiniGame task1={miniGameTasks.task1!} task2={miniGameTasks.task2!} on:winnerSelected={handleWinnerSelected} on:back={handleBackFromMiniGame} />
    {:else}
      <TournamentBracket {tournament} onTournamentUpdate={handleTournamentUpdate} startMiniGame={(task1: Task | null, task2: Task | null) => startMiniGame(task1!, task2!)} />
    {/if}
  {/if}
</main>

<style>
  .task-battle-tournament {
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

  /* Tournament Header Styles */
  .tournament-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    margin-bottom: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .header-content {
    padding: 30px;
    text-align: center;
  }

  .tournament-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
  }

  .tournament-subtitle {
    font-size: 1.2rem;
    color: #6c757d;
    margin: 0 0 25px 0;
    font-weight: 400;
  }

  .header-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .back-button {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
    background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  }

  .back-button:active {
    transform: translateY(0);
  }

  .tournament-status {
    display: flex;
    align-items: center;
  }

  .status-badge {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-badge.active {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  }

  .status-badge.completed {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
    color: #856404;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }
</style>
