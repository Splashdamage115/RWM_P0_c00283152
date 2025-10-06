<script lang="ts">
  import ChildButton from '$lib/childSubmitBox.svelte';
  import ProgressBar from '$lib/progressBar.svelte';

  let items = [
    { id: "item1", label: "Item 1", done: false, submitted: false },
    { id: "item2", label: "Item 2", done: false, submitted: false }
];

  $: completed = items.filter(item => item.submitted).length;
  let total = items.length;

  function handleChildCheck(event: CustomEvent<{ id: string; done: boolean }>) {
    const { id, done } = event.detail;
    items = items.map(item => item.id === id ? { ...item, done } : item);
  }
</script>



<h1>Events Example</h1>
<p>{completed} / {total}</p>

<ProgressBar {completed} {total} />

{#each items as item (item.id)}
  <ChildButton id={item.id} label={item.label} done={item.done} submitted={item.submitted} on:check={handleChildCheck} />
  <br>
{/each}

<input type="button" value="Submit" on:click={() => {
  items = items.map(item => ({ ...item, submitted: item.done }));
}} />