<script>
	import { SvelteDate } from 'svelte/reactivity';
    import TopBarSettings from './TopBarSettings.svelte';
	
	import resetImg from "$icons/symbols/arrow-circular-small-top-left-symbolic.svg";
    import { IndexedDBSystem } from '$scripts/virtual/indexdb';

    const date = new SvelteDate();

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
	  hour: 'numeric',
	  minute: 'numeric'
	});

    const dayFormatter = new Intl.DateTimeFormat(undefined, {
	  month: 'short',
	  day: 'numeric'
	});

    $effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(interval);
		}
    });
	

</script>

<div class="flex absolute w-full  bg-secondary-20 text-secondary-95 justify-center px-4">
	<div class="flex-1 justify-left gap-6 flex flex-row py-2">
		
	</div>
<div class=" font-bold text-center h-fit py-2 flex-1">
	<button class="py-0.5 px-4 rounded-3xl">
    { dayFormatter.format(date) } 
    <span class="inline-block w-4"></span>
    { timeFormatter.format(date) }
	</button>
</div>


<div class="pointer-events-none h-full text-right flex-1 py-2 flex justify-end gap-4">
	<TopBarSettings />

	<button 
		class="w-6 h-6 pointer-events-auto hover:bg-secondary-40 p-0.5 font-bold rounded-full"
		ondblclick={async () => {
			// reset
			await IndexedDBSystem.reset();
			window.location.reload();
		}}
		>
		<img src={resetImg} alt="reset" 
		class="w-full h-full invert mt-[0.5px]" />
	</button>
</div>

</div>

<style>

</style>

