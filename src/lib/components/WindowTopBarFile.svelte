

<script lang="ts">
    import { fileSystem } from "$scripts/fs.svelte";
    import { dispatchClose } from "./WindowManager.svelte";
    import WindowTopBarDraggable from "./WindowTopBarDraggable.svelte";

    const pathArray = $derived(fileSystem.cwd.path.split("/"));

    let back = $state(false);
    let forward = $state(false);
    let pathBox: HTMLDivElement;

    $effect(() => {
        // listen to path array changes
        pathArray;
        back = fileSystem.hasBack();
        forward = fileSystem.hasForward();
        scrollset(pathBox);
    })

    function scrollset(node: HTMLDivElement) {
        node.scrollLeft = node.scrollWidth - node.clientWidth;
        pathBox = node;
    }
</script>


<WindowTopBarDraggable>
    <div class="flex items-center h-full gap-1">
        {#if back}
        <button class="w-4 h-4 bg-white hover:bg-slate-700" 
        onclick={() => fileSystem.back()}></button>
        {:else}
        <button class="w-4 h-4 bg-slate-300"></button>
        {/if}
        {#if forward}
        <button class="w-4 h-4 bg-white hover:bg-slate-700" 
        onclick={() => fileSystem.forward()}></button>
        {:else}
        <button class="w-4 h-4 bg-slate-300"></button>
        {/if}
        <!-- <div class="w-4 h-4 bg-white hover:bg-gray-700" 
        onclick={() => fileSystem.forward()}></div> -->

        <div use:scrollset class="text-nowrap no-scrollbar flex-1 mx-1 bg-gray-300 rounded-md px-2  overflow-x-auto">
            {#each pathArray as path}
                <button class="hover:bg-gray-50">{path}</button>/
            {/each}
        </div>

        <div class="w-4 h-4 bg-white hover:bg-gray-700" 
            onclick={ dispatchClose }
        ></div>     
    </div>

</WindowTopBarDraggable>

<style>
    .no-scrollbar {
        scrollbar-width: none;
    }
</style>