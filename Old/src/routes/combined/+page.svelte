<script lang="ts">
    import { combinedFilter } from '$lib/filters/combined/combined';
    let raw = '1 3 5 7 9';

    $:input = raw.trim().split(/\s+/).filter(Boolean).map(Number);
    $:output = combinedFilter(input);
</script>

<h1>Combined (mine -> peer)</h1>
<label>Input <input bind:value={raw}/></label>
<p>Output: {output.join(' ')}</p>