<script lang="ts">
  import type { Tournament, BracketRound, BracketMatch } from '../types/Task.js';
  import { assignTaskPriorities } from '../utils/bracketGenerator.js';
  import { exportTournamentToCsv } from '../utils/csvParser.js';

  $: if (tournament && tournament.rounds && tournament.rounds.length > 0 && tournament.winner && typeof localStorage !== 'undefined') {
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

  // Calculate responsive vertical positions for each match in each round
  function getMatchPositions(rounds: BracketRound[]) {
    const positions: number[][] = [];
    const matchHeight = typeof window !== 'undefined' 
      ? Math.max(80, Math.min(120, window.innerHeight / 8)) 
      : 100; // Default height for SSR
    const matchGap = typeof window !== 'undefined' 
      ? Math.max(40, Math.min(80, window.innerHeight / 15)) 
      : 60; // Default gap for SSR

    for (let r = 0; r < rounds.length; r++) {
      const round = rounds[r];
      const roundPositions: number[] = [];
      const totalHeight = round.matches.length * matchHeight + (round.matches.length - 1) * matchGap;
      let startY = Math.max(20, (maxBracketHeight(rounds) - totalHeight) / 2);

      for (let m = 0; m < round.matches.length; m++) {
        roundPositions.push(startY + m * (matchHeight + matchGap));
      }
      positions.push(roundPositions);
    }
    return positions;
  }

  function maxBracketHeight(rounds: BracketRound[]) {
    let maxMatches = 0;
    for (const round of rounds) {
      if (round.matches.length > maxMatches) maxMatches = round.matches.length;
    }
    const matchHeight = typeof window !== 'undefined' 
      ? Math.max(80, Math.min(120, window.innerHeight / 8)) 
      : 100;
    const matchGap = typeof window !== 'undefined' 
      ? Math.max(40, Math.min(80, window.innerHeight / 15)) 
      : 60;
    return Math.max(400, maxMatches * matchHeight + (maxMatches - 1) * matchGap + 120);
  }

  // Get responsive round spacing
  function getRoundSpacing() {
    return typeof window !== 'undefined' 
      ? Math.max(250, Math.min(350, window.innerWidth / 5)) 
      : 300; // Default spacing for SSR
  }

  // Get responsive match width
  function getMatchWidth() {
    return typeof window !== 'undefined' 
      ? Math.max(200, Math.min(280, window.innerWidth / 6)) 
      : 220; // Default width for SSR
  }
</script>

<div class="bracket-root">
  {#if tournament.rounds.length > 0}
    
    {#key tournament.rounds}
      <div class="bracket-horizontal" style="height: {maxBracketHeight(tournament.rounds)}px; min-width: {tournament.rounds.length * getRoundSpacing() + 200}px;">
          {#each tournament.rounds as round, roundIdx}
            <div class="bracket-round" style="height: {maxBracketHeight(tournament.rounds)}px; left: {roundIdx * getRoundSpacing()}px; position: absolute; width: {getMatchWidth()}px;">
              {#each round.matches as match, matchIdx}
              <div
                class="bracket-match {match.task1 && match.task2 && match.status === 'pending' ? 'clickable' : ''}"
                style="top: {getMatchPositions(tournament.rounds)[roundIdx][matchIdx]}px; position: absolute; width: {getMatchWidth()}px;"
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
                    x1={roundIdx * getRoundSpacing() + getMatchWidth() * 0.85}
                    y1={getMatchPositions(tournament.rounds)[roundIdx][matchIdx] + (typeof window !== 'undefined' ? Math.max(40, Math.min(60, window.innerHeight / 20)) : 50)}
                    x2={(roundIdx + 1) * getRoundSpacing()}
                    y2={getMatchPositions(tournament.rounds)[roundIdx + 1][Math.floor(matchIdx / 2)] + (typeof window !== 'undefined' ? Math.max(40, Math.min(60, window.innerHeight / 20)) : 50)}
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
            style="top: {getMatchPositions(tournament.rounds)[tournament.rounds.length - 1][0] - 20}px; left: {(tournament.rounds.length) * getRoundSpacing() + (typeof window !== 'undefined' ? Math.max(50, Math.min(80, window.innerWidth / 20)) : 60)}px;"
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
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    position: relative;
    overflow-x: auto;
    overflow-y: auto;
    padding: clamp(15px, 3vw, 40px) clamp(10px, 2vw, 20px);
    box-sizing: border-box;
  }

  .bracket-horizontal {
    display: block;
    position: relative;
    width: 100%;
    margin-top: clamp(20px, 3vh, 30px);
  }

  .bracket-round {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
  }

  .bracket-match {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 2px solid #dee2e6;
    border-radius: clamp(12px, 2vw, 16px);
    padding: clamp(8px, 1.5vw, 16px);
    min-height: clamp(80px, 8vh, 120px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: absolute;
    box-sizing: border-box;
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
    font-size: clamp(0.75rem, 2vw, 0.95rem);
    color: #495057;
    margin: clamp(2px, 0.5vh, 4px) 0;
    font-weight: 600;
    opacity: 1;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    border-radius: clamp(6px, 1.5vw, 10px);
    padding: clamp(4px, 1vw, 8px);
    background: rgba(248, 249, 250, 0.8);
    text-align: center;
    width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    line-height: 1.3;
    min-height: 1.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
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
    margin-top: clamp(4px, 1vh, 8px);
    font-size: clamp(0.7rem, 1.8vw, 0.9rem);
    color: #28a745;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: clamp(2px, 0.8vw, 6px) clamp(4px, 1.2vw, 8px);
    background: rgba(40, 167, 69, 0.1);
    border-radius: clamp(8px, 2vw, 12px);
    border: 1px solid rgba(40, 167, 69, 0.3);
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.2;
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
    padding: clamp(16px, 3vw, 32px) clamp(20px, 4vw, 40px);
    border-radius: clamp(16px, 4vw, 24px);
    font-size: clamp(1.2rem, 4vw, 1.8rem);
    font-weight: 800;
    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
    z-index: 10;
    border: 3px solid #f39c12;
    animation: winner-celebration 2s ease-in-out infinite alternate;
    text-align: center;
    min-width: clamp(150px, 20vw, 250px);
    max-width: 90vw;
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
  }

  .bracket-winner::before {
    content: "🏆";
    font-size: clamp(1.5rem, 5vw, 2.2rem);
    display: block;
    margin-bottom: clamp(4px, 1vh, 8px);
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

  /* Mobile and Touch Device Optimizations */
  @media (max-width: 768px) {
    .bracket-root {
      padding: 10px 5px;
    }

    .bracket-match {
      min-height: 70px;
      touch-action: manipulation;
    }

    .bracket-match.clickable::after {
      content: "👆 Tap to Battle!";
      font-size: 0.7em;
      bottom: -20px;
    }

    .match-participant {
      font-size: 0.75rem;
      padding: 3px 6px;
      min-height: 1.2em;
    }

    .bracket-winner {
      max-width: 95vw;
      left: 50% !important;
      transform: translateX(-50%);
      position: fixed !important;
      top: 50% !important;
      margin-top: -100px;
    }
  }

  @media (max-width: 480px) {
    .bracket-root {
      padding: 5px;
    }

    .bracket-horizontal {
      margin-top: 20px;
    }

    .match-participant {
      font-size: 0.7rem;
      line-height: 1.1;
      padding: 2px 4px;
    }

    .match-winner {
      font-size: 0.6rem;
      padding: 1px 3px;
      margin-top: 2px;
    }
  }

  /* High DPI / Retina Displays */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .bracket-match {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .bracket-match {
      transition: none;
    }

    .bracket-match.clickable {
      animation: none;
    }

    .match-participant.pending,
    .match-participant.winner {
      animation: none;
    }

    .bracket-winner {
      animation: none;
    }

    .bracket-winner::before {
      animation: none;
    }
  }
</style>
