<script lang="ts">
  import type { BracketMatch } from '../types/Task.js';
  
  export let match: BracketMatch;
  export let onMatchClick: (match: BracketMatch) => void = () => {};
  
  function handleMatchClick() {
    // Only allow clicking if both tasks are present and match is pending
    if (match.task1 && match.task2 && match.status === 'pending') {
      onMatchClick(match);
    }
  }
</script>

<div class="bracket-match" class:clickable={match.task1 && match.task2 && match.status === 'pending'} class:completed={match.status === 'completed'}>
  <div class="match-header">
    <span class="round-info">Round {match.round}</span>
    <span class="match-status status-{match.status}">{match.status}</span>
  </div>
  
  <div class="match-contestants" on:click={handleMatchClick} on:keydown={(e) => e.key === 'Enter' && handleMatchClick()} role="button" tabindex="0">
    <div class="contestant" class:winner={match.winner?.id === match.task1?.id} class:bye={!match.task1}>
      {#if match.task1}
        <div class="task-name">{match.task1.name}</div>
        <div class="task-description">{match.task1.description}</div>
      {:else}
        <div class="bye-text">BYE</div>
      {/if}
    </div>
    
    <div class="vs-divider">VS</div>
    
    <div class="contestant" class:winner={match.winner?.id === match.task2?.id} class:bye={!match.task2}>
      {#if match.task2}
        <div class="task-name">{match.task2.name}</div>
        <div class="task-description">{match.task2.description}</div>
      {:else}
        <div class="bye-text">BYE</div>
      {/if}
    </div>
  </div>
  
  {#if match.winner}
    <div class="winner-banner">
      🏆 Winner: {match.winner.name}
    </div>
  {/if}
</div>

<style>
  .bracket-match {
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    margin: 10px;
    min-width: 300px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  
  .bracket-match.clickable {
    cursor: pointer;
  }
  
  .bracket-match.clickable:hover {
    border-color: #007bff;
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
  
  .bracket-match.completed {
    background: #f8f9fa;
    border-color: #28a745;
  }
  
  .match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    font-size: 0.85em;
    font-weight: bold;
  }
  
  .round-info {
    color: #495057;
  }
  
  .match-status {
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 0.75em;
    text-transform: uppercase;
  }
  
  .status-pending {
    background: #fff3cd;
    color: #856404;
  }
  
  .status-in-progress {
    background: #d4edda;
    color: #155724;
  }
  
  .status-completed {
    background: #d1ecf1;
    color: #0c5460;
  }
  
  .match-contestants {
    padding: 15px;
  }
  
  .contestant {
    padding: 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    margin: 5px 0;
    transition: all 0.2s ease;
  }
  
  .contestant.winner {
    background: #d4edda;
    border-color: #28a745;
    box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
  }
  
  .contestant.bye {
    background: #f8f9fa;
    color: #6c757d;
    font-style: italic;
    text-align: center;
  }
  
  .task-name {
    font-weight: bold;
    color: #212529;
    margin-bottom: 4px;
  }
  
  .task-description {
    color: #6c757d;
    font-size: 0.9em;
    line-height: 1.4;
  }
  
  .bye-text {
    font-weight: bold;
    color: #6c757d;
  }
  
  .vs-divider {
    text-align: center;
    font-weight: bold;
    color: #007bff;
    margin: 8px 0;
    font-size: 0.9em;
  }
  
  .winner-banner {
    background: linear-gradient(135deg, #ffd700, #ffed4a);
    color: #856404;
    text-align: center;
    padding: 8px;
    font-weight: bold;
    border-radius: 0 0 6px 6px;
    border-top: 1px solid #ffc107;
  }
</style>
