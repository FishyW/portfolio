<script lang="ts">
    import { browser } from '$app/environment';
    import { tooltip } from '$scripts/ui/tippy.svelte';

	let content: HTMLElement;

	
	
	let isPersisted = $state(false);



	if (browser) {
		(async () => {
			isPersisted = await navigator.storage
				.persisted();
		})();
	}
	
</script>

<div class="hidden">
	<div bind:this={content}>
		<div>
	
    <label for="scales">Persisted</label> 
	<input type="checkbox" id="scales" name="scales" 
		disabled={isPersisted} checked={isPersisted}
		onclick={async e => {
			e.preventDefault();
			const h = await navigator.storage.persist();
			console.log(h);
		}}
		/>
		</div>
	</div>
</div>

<button 
    class="pointer-events-auto hover:bg-secondary-40 p-0.5 px-2 font-bold rounded-full"
    use:tooltip={() => (
		{ content, 
		trigger: 'click',
		interactive: true,
		appendTo: () => document.body
		})}
   
    >S</button>