<script lang="ts">
  import { TaskBattleTournament, type Task } from '$lib';

  let tasks: Task[] = [];

  function handleTournamentComplete(winner: Task) {
    console.log('Tournament completed! Winner:', winner);
    // Here you could save results, navigate, etc.
  }

  function handleGoBack() {
    console.log('Going back...');
    history.back();
  }

  function fillDebugTasks() {
    tasks = [
      { id: 'a', name: 'Task A', description: 'Debug task A' },
      { id: 'b', name: 'Task B', description: 'Debug task B' },
      { id: 'c', name: 'Task C', description: 'Debug task C' },
      { id: 'd', name: 'Task D', description: 'Debug task D' },
      { id: 'e', name: 'Task E', description: 'Debug task E' }
    ];
  }
</script>

<svelte:head>
  <title>Task Battle Tournament</title>
  <meta name="description" content="A tournament-style task battle application" />
</svelte:head>

<main>
  <div class="demo-controls">
    <button class="debug-button" on:click={fillDebugTasks}>
      📝 Fill Debug Tasks
    </button>
    <p class="task-count">Tasks loaded: {tasks.length}</p>
  </div>

  <TaskBattleTournament 
    {tasks}
    showHeader={true}
    onTournamentComplete={handleTournamentComplete}
    onGoBack={handleGoBack}
  />
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .demo-controls {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    margin: 20px;
    margin-bottom: 0;
    padding: 20px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .debug-button {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  }

  .debug-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
  }

  .debug-button:active {
    transform: translateY(0);
  }

  .task-count {
    margin: 10px 0 0 0;
    color: #6c757d;
    font-weight: 500;
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
