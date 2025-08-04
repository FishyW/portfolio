

<script lang="ts">
    import { fileSystem } from "$scripts/ui/fs.svelte";
    import WindowTopBar from "./WindowTopBar.svelte";

    import backImg from "$icons/symbols/left-smaller-symbolic.svg";
    import backDisabledImg from "$icons/symbols/disabled/left-smaller-symbolic.svg";
    import forwardImg from "$icons/symbols/right-smaller-symbolic.svg";
    import forwardDisabledImg from "$icons/symbols/disabled/right-smaller-symbolic.svg";
    import WindowTopBarFilePathButton from "./WindowTopBarFilePathButton.svelte";


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
    <div class="flex items-center h-full gap-1 w-full">
        <button class={["w-7 h-7 p-0.5 whitespace-nowrap flex rounded-md",
        back && "hover:bg-slate-200"]}
     onclick={() => {if (back) {
        fileSystem.back();
        }}}>
            <img src={back ? backImg : backDisabledImg} alt="back"/>
    </button>  

        <div class={["w-7 h-7 p-0.5 whitespace-nowrap flex rounded-md",
        forward && "hover:bg-slate-200"]}
     onclick={() => {if (forward) fileSystem.forward()}}>
            <img src={forward ? forwardImg : forwardDisabledImg} alt="forward"/>
    </div>  

        
        <!-- <div class="w-4 h-4 bg-white hover:bg-gray-700" 
        onclick={() => fileSystem.forward()}></div> -->
        <div use:scrollset class="
        flex items-center text-sm
        text-nowrap no-scrollbar flex-1 mx-1 bg-gray-200 
        p-0.5 rounded-md overflow-x-auto">
            {#each pathTuple as [fullpath, segment], idx}
                    {#if idx !== 0}
                    <div class="mx-2">/</div>
                    {/if}
                    <WindowTopBarFilePathButton  {fullpath} {segment} />
            {/each}
        </div>    
    </div>
</WindowTopBar>

<style>
    .no-scrollbar {
        scrollbar-width: none;
    }
</style>