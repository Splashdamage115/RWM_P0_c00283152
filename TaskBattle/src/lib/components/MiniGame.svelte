<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Task } from '../types/Task.js';

  export let task1: Task;
  export let task2: Task;

  const dispatch = createEventDispatcher();

  function selectWinner(winner: Task, loser: Task) {
    // Trigger the "death" animation for the loser
    const loserElement = document.querySelector(`#task-${loser.id}`);
    if (loserElement) {
      loserElement.classList.add('loser-animation');
    }

    // After animation, dispatch the winner and navigate back
    setTimeout(() => {
      dispatch('winnerSelected', { winner });
    }, 1500); // Match animation duration
  }
</script>

<div class="mini-game">
  <div id="task-{task1.id}" class="task task1" on:click={() => selectWinner(task1, task2)}>
    <h2>{task1.name}</h2>
    <p>{task1.description}</p>
  </div>
  <div class="vs">VS.</div>
  <div id="task-{task2.id}" class="task task2" on:click={() => selectWinner(task2, task1)}>
    <h2>{task2.name}</h2>
    <p>{task2.description}</p>
  </div>
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
    animation: fallOff 1s forwards;
    background: red !important;
    color: white !important;
  }

  @keyframes fallOff {
    to {
      transform: translateY(100vh) rotate(45deg);
      opacity: 0;
    }
  }
</style>
