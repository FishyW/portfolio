<script>
	import { SvelteDate } from 'svelte/reactivity';
    import TopBarSettings from './TopBarSettings.svelte';


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

<div class="absolute w-full bg-gray-500 text-center h-fit p-1 ">
    { dayFormatter.format(date) } 
    <span class="inline-block w-2"></span>
    { timeFormatter.format(date) }
</div>


<div class="pointer-events-none absolute w-full text-right h-fit  ">
	<TopBarSettings />

	<button 
		class="pointer-events-auto hover:bg-gray-400 p-1 px-3 font-bold"
		ondblclick={() => {
			// reset
			localStorage.removeItem("fs");
			window.location.reload();
		}}
		>R</button>
</div>
