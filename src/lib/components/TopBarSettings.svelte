<script lang="ts">
    import { browser } from '$app/environment';
    import { tippy, tooltip } from '$scripts/ui/tippy.svelte';
	import  resetImage from "$icons/symbols/settings-symbolic.svg";
    import { IndexedDBSystem } from '$scripts/virtual/indexdb';
    import type { Instance, Props } from 'tippy.js';
	
	let content: HTMLElement;

	let isPersisted = $state(false);



	if (browser) {
		(async () => {
			isPersisted = await navigator.storage
				.persisted();
		})();
	}

	let hoverInstance: Instance<Props>;
	
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
		}}
		/>
		</div>
	</div>
</div>
	
<button 
    class="w-6 h-6 pointer-events-auto hover:bg-secondary-40 p-0.5 font-bold rounded-full"
    
	use:tippy={() => ({
		content, 
		trigger: 'click',
		interactive: true,
		onShow: () => {
			hoverInstance.disable();
		},
		onHide: () => {
			hoverInstance.enable();
		}
	})}

	use:tippy={() => ({
		content: "Settings",
		onMount: (instance) => {
			hoverInstance = instance;
		}
	})}
   
    ><img src={resetImage} alt="settings" class="w-full h-full invert" /></button>


  