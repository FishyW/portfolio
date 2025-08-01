

<script lang="ts">
    import { DirectoryFile, fileSystem } from "$scripts/ui/fs.svelte";
    import WindowTopBar from "./WindowTopBar.svelte";
    import WindowTopBarIcon from "./WindowTopBarIcon.svelte";

    const pathTuple = $derived.by(() => {
        const splittedPath = fileSystem
            .cwd.path.split("/");
        const pathTuple: [string, string][] = [];
        
        splittedPath.reduce((acc, current) => {
            acc += "/" + current;
            pathTuple.push([acc, current]);
            return acc;
        });

        return pathTuple;
    });


    let back = $state(false);
    let forward = $state(false);
    let pathBox: HTMLDivElement;

    $effect(() => {
        // listen to path array changes
        pathTuple;
        back = fileSystem.hasBack();
        forward = fileSystem.hasForward();
        scrollset(pathBox);
    })

    function scrollset(node: HTMLDivElement) {
        node.scrollLeft = node.scrollWidth - node.clientWidth;
        pathBox = node;
    }
</script>


<WindowTopBar>
    <div class="flex items-center h-full gap-1">
        {#if back}
            <WindowTopBarIcon onclick={() => fileSystem.back()}/>
        <!-- <button class="w-4 h-4 bg-white hover:bg-slate-700" 
        onclick={() => fileSystem.back()}></button> -->
        {:else}
            <WindowTopBarIcon disabled />
        {/if}
        {#if forward}
         <WindowTopBarIcon onclick={() => fileSystem.forward()}/>
    
        {:else}
        <WindowTopBarIcon disabled />
        {/if}
        <!-- <div class="w-4 h-4 bg-white hover:bg-gray-700" 
        onclick={() => fileSystem.forward()}></div> -->
        <div use:scrollset class="text-nowrap no-scrollbar flex-1 mx-1 bg-secondary-95 rounded-md px-2  overflow-x-auto">
            {#each pathTuple as [fullpath, segment]}
                /<button onclick={() => {
                    const directory = fileSystem.findFile(fullpath)
                    if (directory === null || !DirectoryFile.isDirectory(directory)) {
                        throw new Error("Directory not found!")
                    }
                    fileSystem.changeDirectory(directory);
                }} class="hover:bg-gray-50">{segment}</button>
            {/each}
        </div>    
    </div>
</WindowTopBar>

<style>
    .no-scrollbar {
        scrollbar-width: none;
    }
</style>