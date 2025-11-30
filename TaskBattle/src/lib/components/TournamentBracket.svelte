<script lang="ts">
  import type { Tournament, BracketMatch } from '../types/Task.js';
  import BracketRoundComponent from './BracketRound.svelte';
  import { generateBracket } from '../utils/bracketGenerator.js';
  import { exportTournamentToCsv } from '../utils/csvParser.js';
  
  export let tournament: Tournament;
  export let onTournamentUpdate: (tournament: Tournament) => void = () => {};
  export let startMiniGame: (task1: BracketMatch['task1'], task2: BracketMatch['task2']) => void;
  
  function handleMatchClick(match: BracketMatch) {
    // This is where mini-game integration will go
    // For now, we'll just show an alert
    console.log('Match clicked:', match);
    startMiniGame(match.task1, match.task2);
  }
  
  // Helper function to get tournament status
  function getTournamentStatus() {
    if (tournament.winner) {
      return 'completed';
    }
    
    const hasActivematches = tournament.rounds.some(round => 
      round.matches.some(match => match.status === 'in-progress')
    );
    
    if (hasActivematches) {
      return 'in-progress';
    }
    
    return 'pending';
  }
  
  $: tournamentStatus = getTournamentStatus();

  // Export CSV when tournament is completed
  $: if (tournamentStatus === 'completed' && tournament.winner) {
    const csvContent = exportTournamentToCsv(tournament);
    // Write CSV to static/tasks.csv (requires server-side or API call in real app)
    // For demo, log to console
    console.log('Exporting tournament results to CSV:', csvContent);
    // TODO: Implement actual file write if running in Node/server context
  }
</script>

<div class="tournament-bracket">
  <div class="tournament-header">
    <h1>🏆 Task Battle Tournament</h1>
    <div class="tournament-info">
      <span class="participant-count">{tournament.tasks.length} participants</span>
      <span class="status-badge status-{tournamentStatus}">{tournamentStatus}</span>
    </div>
    
    {#if tournament.winner}
      <div class="champion-banner">
        🎉 Champion: <strong>{tournament.winner.name}</strong> 🎉
      </div>
    {/if}
  </div>
  
  <div class="bracket-container">
    {#if tournament.rounds.length === 0}
      <div class="empty-bracket">
        <p>No tournament data available</p>
      </div>
    {:else}
      <div class="bracket-scroll">
        {#each tournament.rounds as round, roundIndex (round.round)}
          <div class="bracket-round">
            <BracketRoundComponent {round} onMatchClick={handleMatchClick} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <div class="tournament-footer">
    <p class="mini-game-note">
      💡 Click on matches with two participants to trigger mini-games (coming soon!)
    </p>
  </div>
</div>

<style>
  .tournament-bracket {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .tournament-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .tournament-header h1 {
    margin: 0 0 15px 0;
    color: #212529;
    font-size: 2.2em;
    font-weight: bold;
  }
  
  .tournament-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 15px;
  }
  
  .participant-count {
    background: #e9ecef;
    color: #495057;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.9em;
  }
  
  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.9em;
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
  
  .champion-banner {
    background: linear-gradient(135deg, #ffd700, #ffed4a);
    color: #856404;
    padding: 15px;
    border-radius: 8px;
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 15px;
    border: 2px solid #ffc107;
  }
  
  .bracket-container {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .bracket-scroll {
    display: flex;
    overflow-x: auto;
    gap: 30px;
    padding: 20px 0;
    min-height: 400px;
    position: relative;
  }

  .bracket-round {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }


  
  .empty-bracket {
    text-align: center;
    padding: 60px;
    color: #6c757d;
    font-style: italic;
  }
  
  .tournament-footer {
    text-align: center;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .mini-game-note {
    margin: 0;
    color: #6c757d;
    font-style: italic;
    font-size: 0.9em;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .tournament-bracket {
      padding: 15px;
    }
    
    .tournament-header h1 {
      font-size: 1.8em;
    }
    
    .tournament-info {
      flex-direction: column;
      gap: 10px;
    }
    
    .bracket-scroll {
      gap: 20px;
    }
  }
  
  /* Scrollbar styling */
  .bracket-scroll::-webkit-scrollbar {
    height: 8px;
  }
  
  .bracket-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .bracket-scroll::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 4px;
  }
  
  .bracket-scroll::-webkit-scrollbar-thumb:hover {
    background: #0056b3;
  }
</style>
