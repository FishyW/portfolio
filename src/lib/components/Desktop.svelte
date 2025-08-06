<script module lang="ts">
    export let offscreenBuffer: {element?: HTMLElement} = $state({});
    import backgroundImg from "$assets/bg.webp"
    
    let showReset = $state(false);

    export function showResetPrompt() {
        showReset = true;
    }

</script>

<script>
    import Dash from "./Dash.svelte"
    import ContextMenu from "./ContextMenu.svelte";
    import TopBar from "./TopBar.svelte"
    import WindowManager from "./WindowManager.svelte";
    import DesktopResetPrompt from "./DesktopResetPrompt.svelte";

</script>


<div  
style:background-image="url({backgroundImg})" 
class="h-full w-full bg-cover flex flex-col relative">
    <!-- Position utility "breaks" out of the page flow -->
        <TopBar />
        
        <Dash />


        {#if !showReset}
            <WindowManager />
        {:else}
            <DesktopResetPrompt oncancel={() => showReset = false} />
        {/if}
        
</div>


<!-- can't place the context menu as a child of the file menu -->
<!-- position fixed apparently gets "reset" under transform -->
<ContextMenu />



<!-- Offscreen Buffer to set drag image -->
<div  bind:this={offscreenBuffer.element} class="fixed -top-96 -left-96"></div>
