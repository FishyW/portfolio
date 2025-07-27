<script>
    import { fileSystem, FileSystem } from '$scripts/ui/fs.svelte';
    import saveAs from 'file-saver';
	import { SvelteDate } from 'svelte/reactivity';
	import { showOpenFilePicker } from 'show-open-file-picker'


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

	async function uploadFileSystem() {
		const files = await showOpenFilePicker({
			types: [
			{
				description: "",
				accept: {
					"application/json": [".json"],
				},
			},
			],
		})
		files.forEach(async file => {
			const fileHandle = await file.getFile();
			const contents = await fileHandle.text();
			// check if it is valid
			await FileSystem.init(JSON.parse(contents)); 
			localStorage.setItem("fs", contents);
			window.location.reload();			

		})

	}

	async function downloadFileSystem() {
		// reset
		const file = await fileSystem.serialize();
		saveAs(new File([JSON.stringify(file, null, 2)], "fs.json"));
	}
</script>

<div class="absolute w-full bg-gray-500 text-center h-fit p-1 ">
    { dayFormatter.format(date) } 
    <span class="inline-block w-2"></span>
    { timeFormatter.format(date) }
</div>

<div class="pointer-events-none absolute w-full text-right h-fit  ">
	<button 
		class="pointer-events-auto hover:bg-gray-400 p-1 px-3 font-bold"
		ondblclick={uploadFileSystem}
		>L</button>


	<button 
		class="pointer-events-auto hover:bg-gray-400 p-1 px-3 font-bold"
		ondblclick={downloadFileSystem}
		>S</button>
	<button 
		class="pointer-events-auto hover:bg-gray-400 p-1 px-3 font-bold"
		ondblclick={() => {
			// reset
			localStorage.removeItem("fs");
			window.location.reload();
		}}
		>R</button>
</div>
