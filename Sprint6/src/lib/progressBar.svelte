<script lang="ts">
    export let completed:number = 0;
    export let total:number = 0;
    $: barWidth = Math.round((completed / total) * 100);
</script>

<style>
  #myBar {
    width: 1%;
    height: 30px;
    background-color: #4CAF50;
  }
  #myProgress {
    width: 100%;
    background-color: #ddd;
  }
</style>

<span>{barWidth}%</span>
<div id="myProgress">
		<div id="myBar" style="width: {barWidth}%"></div>
</div>