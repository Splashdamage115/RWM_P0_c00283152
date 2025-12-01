<script lang="ts">
  import type { BracketRound, BracketMatch } from '../types/Task.js';
  import BracketMatchComponent from './BracketMatch.svelte';
  
  export let round: BracketRound;
  export let onMatchClick: (match: BracketMatch) => void = () => {};
</script>

<div class="bracket-round">
  <div class="round-header">
    <h3>Round {round.round}</h3>
    <span class="match-count">{round.matches.length} match{round.matches.length !== 1 ? 'es' : ''}</span>
  </div>
  
  <div class="round-matches">
    {#each round.matches as match (match.id)}
      <BracketMatchComponent {match} {onMatchClick} />
    {/each}
  </div>
</div>

<style>
  .bracket-round {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 20px;
    min-width: 320px;
  }
  
  .round-header {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    padding: 12px 20px;
    border-radius: 8px 8px 0 0;
    width: 100%;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .round-header h3 {
    margin: 0;
    font-size: 1.2em;
    font-weight: bold;
  }
  
  .match-count {
    font-size: 0.85em;
    opacity: 0.9;
    display: block;
    margin-top: 2px;
  }
  
  .round-matches {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px 0;
    width: 100%;
    align-items: center;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .bracket-round {
      margin: 0 10px;
      min-width: 280px;
    }
    
    .round-header {
      padding: 10px 15px;
    }
    
    .round-header h3 {
      font-size: 1.1em;
    }
  }
</style>
