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
    const matchHeight = 60;
    const matchGap = 40;

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
    return maxMatches * 60 + (maxMatches - 1) * 40 + 80;
  }
</script>

<div class="bracket-root">
  {#if tournament.rounds.length > 0}
    {#key tournament.rounds}
      <div class="bracket-horizontal" style="height: {maxBracketHeight(tournament.rounds)}px;">
        {#each tournament.rounds as round, roundIdx}
          <div class="bracket-round" style="height: {maxBracketHeight(tournament.rounds)}px; left: {roundIdx * 220}px; position: absolute;">
            {#each round.matches as match, matchIdx}
              <div
                class="bracket-match"
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
                    x1={roundIdx * 220 + 160}
                    y1={getMatchPositions(tournament.rounds)[roundIdx][matchIdx] + 30}
                    x2={(roundIdx + 1) * 220}
                    y2={getMatchPositions(tournament.rounds)[roundIdx + 1][Math.floor(matchIdx / 2)] + 30}
                    stroke="#bbb"
                    stroke-width="2"
                  />
                {/if}
              {/each}
            {/if}
          {/each}
        </svg>
        {#if tournament.winner}
          <div
            class="bracket-winner"
            style="top: {getMatchPositions(tournament.rounds)[tournament.rounds.length - 1][0]}px; left: {(tournament.rounds.length) * 220}px;"
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
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow-x: auto;
  }
  .bracket-horizontal {
    display: block;
    position: relative;
    width: 100%;
  }
  .bracket-round {
    position: absolute;
    top: 0;
    left: 0;
    width: 220px;
    height: 100%;
  }
  .bracket-match {
    background: #f5f5f5;
    border: 2px solid #bbb;
    border-radius: 8px;
    padding: 16px 24px;
    min-width: 160px;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: border-color 0.2s;
    position: absolute;
    margin-bottom: 32px;
  }
  .bracket-match:hover {
    border-color: #007bff;
  }
  .match-participant {
    font-size: 1em;
    color: #333;
    margin: 2px 0;
    font-weight: 500;
    opacity: 1;
    transition: opacity 0.2s;
    border: 2px solid transparent;
    border-radius: 6px;
    padding: 2px 8px;
  }
  .match-participant.pending {
    border-color: #007bff;
    background: #eaf4ff;
  }
  .match-participant.loser {
    opacity: 0.5;
    text-decoration: line-through;
  }
  .match-participant.winner {
    color: #007bff;
    font-weight: bold;
    opacity: 1;
  }
  .match-winner {
    margin-top: 6px;
    font-size: 0.95em;
    color: #007bff;
    font-weight: bold;
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
    background: #ffd700;
    color: #856404;
    padding: 18px 32px;
    border-radius: 12px;
    font-size: 1.4em;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    z-index: 3;
  }
</style>
