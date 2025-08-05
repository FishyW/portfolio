

<script lang="ts">
    import WindowTopBar from "./WindowTopBar.svelte";

    import { forward, back } from "$scripts/ui/operations.svelte";
    import { fileSystem } from "$scripts/ui/fs.svelte";

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


    let hasBack = $state(false);
    let hasForward = $state(false);
    let pathBox: HTMLDivElement;

    $effect(() => {
        // listen to path array changes
        pathTuple;
        hasBack = fileSystem.hasBack();
        hasForward = fileSystem.hasForward();
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
        hasBack && "hover:bg-slate-200"]}
     onclick={() => {if (hasBack) back()}}>
            <img src={hasBack ? backImg : backDisabledImg} alt="back"/>
    </button>  

        <div class={["w-7 h-7 p-0.5 whitespace-nowrap flex rounded-md",
        hasForward && "hover:bg-slate-200"]}
     onclick={() => {if (hasForward) forward()}}>
            <img src={hasForward ? forwardImg : forwardDisabledImg} alt="forward"/>
    </div>  

        
     
        <div use:scrollset class="
        flex items-center text-sm
        text-nowrap no-scrollbar flex-1 mx-1 bg-gray-200 
        p-0.5 rounded-md overflow-x-auto">
            {#each pathTuple as [fullpath, segment], idx}
                    {#if idx !== 0}
                    <div class="mx-2 text-secondary-70">/</div>
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