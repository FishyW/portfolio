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
</style>

{@render children()}

