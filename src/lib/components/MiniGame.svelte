<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Task } from '../types/Task.js';

  export let task1: Task;
  export let task2: Task;

  const dispatch = createEventDispatcher();
  let battleInProgress = false;
  let selectedWinner: Task | null = null;
  let selectedLoser: Task | null = null;
  let animatingWinner = false;
  let animatingLoser = false;

  function selectWinner(winner: Task, loser: Task) {
    if (battleInProgress) return;
    
    battleInProgress = true;
    selectedWinner = winner;
    selectedLoser = loser;

    // Trigger animations using reactive variables
    animatingWinner = true;
    animatingLoser = true;

    // After animation completes, dispatch the winner and navigate back
    setTimeout(() => {
      dispatch('winnerSelected', { winner });
    }, 1500); // Match animation duration
  }

  function goBack() {
    if (battleInProgress) return;
    dispatch('back');
  }

  // Handle keyboard events
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !battleInProgress) {
      goBack();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="mini-game">
  <button class="back-button {battleInProgress ? 'disabled' : ''}" on:click={goBack} disabled={battleInProgress}>
    ← Back to Bracket
  </button>
  
  <div id="task-{task1.id}" class="task task1 
    {battleInProgress ? 'battle-disabled' : ''} 
    {animatingWinner && selectedWinner?.id === task1.id ? 'winner-animation' : ''}
    {animatingLoser && selectedLoser?.id === task1.id ? 'loser-animation' : ''}" 
    on:click={() => selectWinner(task1, task2)}>
    <h2>{task1.name}</h2>
    <p>{task1.description}</p>
  </div>
  <div class="vs {battleInProgress ? 'battle-active' : ''}">VS.</div>
  <div id="task-{task2.id}" class="task task2 
    {battleInProgress ? 'battle-disabled' : ''} 
    {animatingWinner && selectedWinner?.id === task2.id ? 'winner-animation' : ''}
    {animatingLoser && selectedLoser?.id === task2.id ? 'loser-animation' : ''}" 
    on:click={() => selectWinner(task2, task1)}>
    <h2>{task2.name}</h2>
    <p>{task2.description}</p>
  </div>
  
  {#if !battleInProgress}
    <div class="instructions">
      <p>Click on the task you want to advance to the next round</p>
      <p><small>Press ESC to go back</small></p>
    </div>
  {/if}
  
  {#if battleInProgress && selectedWinner}
    <div class="battle-result">
      <h1>🏆 {selectedWinner.name} Wins!</h1>
    </div>
  {/if}
</div>

<style>
  .mini-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: linear-gradient(135deg, #ff7eb3, #ff758c);
    color: white;
    font-family: Arial, sans-serif;
    position: relative;
  }

  .task {
    position: absolute;
    width: 200px;
    padding: 20px;
    border-radius: 8px;
    background: white;
    color: black;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s ease, background 0.3s ease;
  }

  .task:hover {
    transform: scale(1.1);
    background: #f0f0f0;
  }

  .task1 {
    top: 20%;
    left: 20%;
  }

  .task2 {
    bottom: 20%;
    right: 20%;
  }

  .vs {
    font-size: 3em;
    font-weight: bold;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .loser-animation {
    animation: fallOff 1.2s forwards;
    background: #dc3545 !important;
    color: white !important;
    z-index: 1;
  }

  .winner-animation {
    animation: celebrate 1.2s forwards;
    background: #28a745 !important;
    color: white !important;
    z-index: 2;
  }

  @keyframes fallOff {
    0% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    25% {
      transform: scale(0.9) rotate(90deg);
      opacity: 0.8;
    }
    50% {
      transform: scale(0.7) rotate(180deg);
      opacity: 0.6;
    }
    75% {
      transform: scale(0.4) rotate(270deg);
      opacity: 0.3;
    }
    100% {
      transform: scale(0.1) rotate(360deg) translateY(200px);
      opacity: 0;
    }
  }

  @keyframes celebrate {
    0% {
      transform: scale(1);
    }
    20% {
      transform: scale(1.15) rotate(3deg);
    }
    40% {
      transform: scale(1.25) rotate(-3deg);
    }
    60% {
      transform: scale(1.2) rotate(2deg);
    }
    80% {
      transform: scale(1.1) rotate(-1deg);
    }
    100% {
      transform: scale(1.15);
      box-shadow: 0 0 30px rgba(40, 167, 69, 0.8);
    }
  }

  .task.battle-disabled {
    pointer-events: none;
    opacity: 0.8;
  }

  .vs.battle-active {
    animation: pulse 0.5s infinite alternate;
    color: #ffd700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  }

  .battle-result {
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 10;
    animation: slideDown 0.5s ease-out;
  }

  .battle-result h1 {
    font-size: 2.5em;
    margin: 0;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    animation: glow 1s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from {
      transform: translate(-50%, -50%) scale(1);
    }
    to {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-100px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes glow {
    from {
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    }
    to {
      text-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 215, 0, 0.8);
    }
  }

  .back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 5;
    font-weight: 500;
  }

  .back-button:hover:not(.disabled) {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .back-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .instructions {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 10px;
    backdrop-filter: blur(10px);
    animation: fadeIn 0.8s ease-out;
  }

  .instructions p {
    margin: 5px 0;
    font-size: 1.1em;
  }

  .instructions small {
    opacity: 0.8;
    font-style: italic;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
