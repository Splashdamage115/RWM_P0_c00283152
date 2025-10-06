<script lang="ts">
import { createEventDispatcher } from 'svelte';

export let id:string = "";
export let label:string = "";
export let submitted:boolean = false;
export let done:boolean = false;

const dispatch = createEventDispatcher();

  function handleCheck() {
    dispatch('check', {id, done});
  } 
</script>

<label>
<input type="checkbox" bind:checked={done} onchange={handleCheck} />
{label}
</label>
