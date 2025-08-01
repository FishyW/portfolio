<script lang="ts">
	import '../app.css';
	import "@fontsource-variable/inter/standard.css";


	let { children } = $props();
	
</script>
<style>
	:global(body) {
    	font-family: "Inter Variable";
		font-weight: 500;
		font-size: 1rem;
  	}

	:global(button:hover) {
		background-color: var(--color-secondary-40);
	}

	:global(img) {
		user-drag: none;
		-webkit-user-drag: none;
		user-select: none;
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}

</style>

{@render children()}

