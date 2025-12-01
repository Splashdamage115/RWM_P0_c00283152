# Simple Integration Guide: TaskBattle Tournament in Another Svelte App

## 🚀 Quick 7-Step Integration

### Step 1: Copy the Library Files
Copy the entire `src/lib` folder from this TaskBattle project to your target Svelte project's `src/lib` directory.

### Step 2: Install Dependencies (if needed)
Make sure your target project has Svelte installed:
```bash
npm install svelte
```

### Step 3: Import the Component
In your Svelte page/component where you want the tournament:
```svelte
<script>
  import { TaskBattleTournament } from '$lib';
</script>
```

### Step 4: Prepare Your Tasks Data
Create an array of tasks with the required format:
```javascript
const myTasks = [
  { id: '1', name: 'Task A', description: 'First task to prioritize' },
  { id: '2', name: 'Task B', description: 'Second task to prioritize' },
  { id: '3', name: 'Task C', description: 'Third task to prioritize' },
  { id: '4', name: 'Task D', description: 'Fourth task to prioritize' }
];
```

### Step 5: Add the Tournament Component
Use the component in your template:
```svelte
<TaskBattleTournament 
  tasks={myTasks}
  onTournamentComplete={(winner) => {
    console.log('Tournament winner:', winner);
    // Handle the result - save to database, navigate, etc.
  }}
  onGoBack={() => {
    // Handle back navigation
    history.back(); // or your custom navigation
  }}
/>
```

### Step 6: Style Integration (Optional)
Add custom CSS to integrate with your app's design:
```css
:global(.task-battle-tournament) {
  /* Override tournament background if needed */
  background: your-app-background;
}
```

### Step 7: Test the Integration
Run your Svelte app and navigate to the page with the tournament to test functionality.

## 📝 Complete Example

Here's a complete example file for your Svelte app:

```svelte
<!-- YourTournamentPage.svelte -->
<script>
  import { TaskBattleTournament } from '$lib';
  
  // Your tasks data
  const projectTasks = [
    { id: '1', name: 'Design Database Schema', description: 'Create the database structure' },
    { id: '2', name: 'Build User Interface', description: 'Design and implement the UI' },
    { id: '3', name: 'API Development', description: 'Create backend endpoints' },
    { id: '4', name: 'Testing & QA', description: 'Test the application thoroughly' },
    { id: '5', name: 'Documentation', description: 'Write user and technical docs' },
    { id: '6', name: 'Deployment', description: 'Deploy to production environment' }
  ];
  
  function handleWinner(winningTask) {
    console.log('Highest priority task:', winningTask.name);
    // Save to your database or state management
    // Navigate to next page, etc.
  }
  
  function handleBack() {
    // Your custom back navigation
    window.location.href = '/dashboard'; // or use your router
  }
</script>

<div class="page-container">
  <TaskBattleTournament 
    tasks={projectTasks}
    showHeader={true}
    onTournamentComplete={handleWinner}
    onGoBack={handleBack}
  />
</div>

<style>
  .page-container {
    width: 100%;
    min-height: 100vh;
  }
</style>
```

## 🔧 Task Data Format

Each task must have these properties:
- `id`: Unique string identifier
- `name`: Display name for the task
- `description`: Description of the task

## ⚡ That's It!

Your TaskBattle Tournament is now integrated and ready to use in your Svelte application!
