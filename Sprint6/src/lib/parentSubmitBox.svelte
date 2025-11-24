<script lang="ts">
  import ChildButton from '$lib/childSubmitBox.svelte';
  import ProgressBar from '$lib/progressBar.svelte';
  import { writable, derived } from 'svelte/store';

  let initialItems = [
    { id: "item1", label: "Item 1", done: false, submitted: false },
    { id: "item2", label: "Item 2", done: false, submitted: false }
];
  const total = initialItems.length;

  const itemStore = writable(initialItems);
  export const completedStore = derived(itemStore, $items => $items.filter(item => item.submitted).length);
  export const percentStore = derived(itemStore, $items => ($items.filter(item => item.submitted).length / $items.length) * 100);

  function handleChildCheck(event: CustomEvent<{ id: string; done: boolean }>) {
    const { id, done } = event.detail;
    
itemStore.update(items =>
  items.map(item => item.id === id ? { ...item, done } : item)
);

  }
  function handleSubmit() {
    
    
itemStore.update(items =>
    items.map(item => item.done ? { ...item, submitted: true } : item)
  );

  }
</script>



<h1>Events Example</h1>
<p>{$completedStore} / {total} - { $percentStore }%</p>

<ProgressBar completed={$completedStore} total={total} />

{#each $itemStore as item (item.id)}
  <ChildButton id={item.id} label={item.label} done={item.done} submitted={item.submitted} on:check={handleChildCheck} />
  <br>
{/each}

<input type="button" value="Submit" on:click={handleSubmit} />