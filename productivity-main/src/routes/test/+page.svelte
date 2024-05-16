<script>
	let w;
	let h;
	let size = 42;
	let text = 'edit me';
</script>

<input type="range" bind:value={size} />
<input bind:value={text} />

<p>size: {w}px x {h}px</p>

  <div bind:clientWidth={w} bind:clientHeight={h} style="position: absolute; left: 100px; right: 10px; display: table">
    <textarea
      value="{w} {h}"
      draggable="true"
    />
  </div>
<style>
	input {
		display: block;
	}
</style>
