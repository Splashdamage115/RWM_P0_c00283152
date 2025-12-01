<script lang="ts">
  import type { Tournament, BracketRound, BracketMatch } from '../types/Task.js';
  import { assignTaskPriorities } from '../utils/bracketGenerator.js';
  import { exportTournamentToCsv } from '../utils/csvParser.js';

  $: if (tournament && tournament.rounds && tournament.rounds.length > 0 && tournament.winner) {
    const prioritizedTasks = assignTaskPriorities(tournament);
    localStorage.setItem('taskBattleResults', JSON.stringify(prioritizedTasks));
    console.log('Saved prioritized tasks to localStorage:', prioritizedTasks);
  }

  export let tournament: Tournament;
  export let onTournamentUpdate: (tournament: Tournament) => void = () => {};
  export let startMiniGame: (task1: BracketMatch['task1'], task2: BracketMatch['task2']) => void;

  function handleMatchClick(match: BracketMatch) {
    startMiniGame(match.task1, match.task2);
  }

  // Calculate vertical positions for each match in each round
  function getMatchPositions(rounds: BracketRound[]) {
    const positions: number[][] = [];
    let prevRoundY: number[] = [];
    const matchHeight = 120; // Increased to accommodate taller cards
    const matchGap = 60; // Increased gap to prevent overlap

    for (let r = 0; r < rounds.length; r++) {
      const round = rounds[r];
      const roundPositions: number[] = [];
      const totalHeight = round.matches.length * matchHeight + (round.matches.length - 1) * matchGap;
      let startY = (maxBracketHeight(rounds) - totalHeight) / 2;

      for (let m = 0; m < round.matches.length; m++) {
        roundPositions.push(startY + m * (matchHeight + matchGap));
      }
      positions.push(roundPositions);
      prevRoundY = roundPositions;
    }
    return positions;
  }

  function maxBracketHeight(rounds: BracketRound[]) {
    let maxMatches = 0;
    for (const round of rounds) {
      if (round.matches.length > maxMatches) maxMatches = round.matches.length;
    }
    return maxMatches * 120 + (maxMatches - 1) * 60 + 120; // Updated for new sizing
  }
</script>

<div class="bracket-root">
  {#if tournament.rounds.length > 0}
    <div class="round-labels">
      {#each tournament.rounds as round, roundIdx}
        <div class="round-label" style="left: {roundIdx * 320 + 110}px;">
          {#if roundIdx === tournament.rounds.length - 1}
            🏆 Final
          {:else if roundIdx === tournament.rounds.length - 2}
            🥉 Semi-Final
          {:else}
            Round {roundIdx + 1}
          {/if}
        </div>
      {/each}
    </div>
    
    {#key tournament.rounds}
      <div class="bracket-horizontal" style="height: {maxBracketHeight(tournament.rounds)}px;">
          {#each tournament.rounds as round, roundIdx}
            <div class="bracket-round" style="height: {maxBracketHeight(tournament.rounds)}px; left: {roundIdx * 320}px; position: absolute;">
              {#each round.matches as match, matchIdx}
              <div
                class="bracket-match {match.task1 && match.task2 && match.status === 'pending' ? 'clickable' : ''}"
                style="top: {getMatchPositions(tournament.rounds)[roundIdx][matchIdx]}px; position: absolute;"
                on:click={() => (match.task1 && match.task2 && match.status === 'pending') ? handleMatchClick(match) : null}
                style:cursor={match.task1 && match.task2 && match.status === 'pending' ? 'pointer' : 'default'}
              >
                <div class="match-participant
                  {match.status === 'completed' && match.winner && match.task1 && match.winner.id !== match.task1.id ? 'loser' : ''}
                  {match.status === 'completed' && match.winner && match.task1 && match.winner.id === match.task1.id ? 'winner' : ''}
                  {match.status === 'pending' && match.task1 ? 'pending' : ''}">
                  {match.task1 ? match.task1.name : 'TBD'}
                </div>
                <div class="match-participant
                  {match.status === 'completed' && match.winner && match.task2 && match.winner.id !== match.task2.id ? 'loser' : ''}
                  {match.status === 'completed' && match.winner && match.task2 && match.winner.id === match.task2.id ? 'winner' : ''}
                  {match.status === 'pending' && match.task2 ? 'pending' : ''}">
                  {match.task2 ? match.task2.name : 'TBD'}
                </div>
                {#if match.winner}
                  <div class="match-winner">{match.winner.name}</div>
                {/if}
              </div>
            {/each}
          </div>
        {/each}
        <svg class="bracket-lines" width="100%" height="{maxBracketHeight(tournament.rounds)}">
          {#each tournament.rounds as round, roundIdx}
            {#if roundIdx < tournament.rounds.length - 1}
              {#each round.matches as match, matchIdx}
                {#if tournament.rounds[roundIdx + 1]}
                  <!-- Connect current match to next round's winner slot -->
                  <line
                    x1={roundIdx * 320 + 220}
                    y1={getMatchPositions(tournament.rounds)[roundIdx][matchIdx] + 40}
                    x2={(roundIdx + 1) * 320}
                    y2={getMatchPositions(tournament.rounds)[roundIdx + 1][Math.floor(matchIdx / 2)] + 40}
                    stroke="#cbd5e0"
                    stroke-width="3"
                    stroke-dasharray="5,5"
                  />
                {/if}
              {/each}
            {/if}
          {/each}
        </svg>
        {#if tournament.winner}
          <div
            class="bracket-winner"
            style="top: {getMatchPositions(tournament.rounds)[tournament.rounds.length - 1][0] - 20}px; left: {(tournament.rounds.length) * 320 + 60}px;"
          >
            <span>{tournament.winner.name}</span>
          </div>
        {/if}
      </div>
    {/key}
  {/if}
</div>

<style>
  .bracket-root {
    width: 100vw;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    position: relative;
    overflow-x: auto;
    padding: 40px 20px 20px;
  }

  .round-labels {
    position: absolute;
    top: 20px;
    left: 20px;
    width: calc(100% - 40px);
    height: 30px;
    z-index: 5;
  }

  .round-label {
    position: absolute;
    font-size: 1.1rem;
    font-weight: 700;
    color: #495057;
    text-align: center;
    padding: 6px 16px;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 2px solid #dee2e6;
    transform: translateX(-50%);
  }

  .bracket-horizontal {
    display: block;
    position: relative;
    width: 100%;
    margin-top: 50px;
  }

  .bracket-round {
    position: absolute;
    top: 0;
    left: 0;
    width: 240px;
    height: 100%;
  }

  .bracket-match {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 2px solid #dee2e6;
    border-radius: 16px;
    padding: 12px 16px;
    width: 220px;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: absolute;
    margin-bottom: 32px;
  }
  .bracket-match:hover {
    border-color: #007bff;
  }
  .bracket-match.clickable {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border-color: #2196f3;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
    animation: pulse-border 2s infinite;
  }
  .bracket-match.clickable:hover {
    background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
    border-color: #1976d2;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(33, 150, 243, 0.3);
  }
  .bracket-match.clickable::after {
    content: "⚡ Click to Battle!";
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8em;
    color: #2196f3;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 8px;
    border-radius: 4px;
    white-space: nowrap;
  }
  @keyframes pulse-border {
    0%, 100% {
      border-color: #2196f3;
    }
    50% {
      border-color: #ff9800;
    }
  }
  .match-participant {
    font-size: 0.9rem;
    color: #495057;
    margin: 2px 0;
    font-weight: 600;
    opacity: 1;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 4px 8px;
    background: rgba(248, 249, 250, 0.8);
    text-align: center;
    width: 100%;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .match-participant.pending {
    border-color: #007bff;
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%);
    color: #1976d2;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
    animation: glow-pending 2s ease-in-out infinite alternate;
  }

  .match-participant.loser {
    opacity: 0.4;
    text-decoration: line-through;
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 50%);
    border-color: #f44336;
    color: #c62828;
  }

  .match-participant.winner {
    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 50%);
    border-color: #4caf50;
    color: #2e7d32;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    animation: glow-winner 1.5s ease-in-out infinite alternate;
  }

  @keyframes glow-pending {
    from { box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2); }
    to { box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4); }
  }

  @keyframes glow-winner {
    from { box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
    to { box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5); }
  }

  .match-winner {
    margin-top: 8px;
    font-size: 0.85rem;
    color: #28a745;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 8px;
    background: rgba(40, 167, 69, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(40, 167, 69, 0.3);
  }

  .bracket-lines {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
    width: 100%;
    height: 100%;
  }

  .bracket-winner {
    position: absolute;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
    color: #856404;
    padding: 24px 40px;
    border-radius: 20px;
    font-size: 1.6rem;
    font-weight: 800;
    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
    z-index: 10;
    border: 3px solid #f39c12;
    animation: winner-celebration 2s ease-in-out infinite alternate;
    text-align: center;
    min-width: 200px;
  }

  .bracket-winner::before {
    content: "🏆";
    font-size: 2rem;
    display: block;
    margin-bottom: 8px;
    animation: trophy-bounce 1s ease-in-out infinite alternate;
  }

  @keyframes winner-celebration {
    from { 
      transform: scale(1);
      box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
    }
    to { 
      transform: scale(1.05);
      box-shadow: 0 12px 48px rgba(255, 215, 0, 0.6);
    }
  }

  @keyframes trophy-bounce {
    from { transform: translateY(0px); }
    to { transform: translateY(-5px); }
  }
</style>
