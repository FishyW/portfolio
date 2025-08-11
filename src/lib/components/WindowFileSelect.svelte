<script lang="ts">
    import { setContext } from "svelte";

    let { value = $bindable(), children } = $props();

    let showOptions = $state(false);

    function select(newValue: string) {
        value = newValue;
        showOptions = false;
    }

    setContext("select", select);
</script>

<div class="relative">
    <!-- used to compute width -->
    <div class="flex flex-col invisible">
        <button class="p-1 w-full flex items-center"> 
        { value }
            <div class="flex-1"></div>
            <div class="rotate-180 w-0 h-0 mr-1 border-4 border-t-0 border-b-secondary-40 border-l-transparent border-r-transparent "></div>
        </button>
        <div class="w-fit flex-col h-0 flex px-3.5 invisible">
            {@render children()}
        </div>
        
    </div>


<div
class="text-sm absolute top-0 left-0  text-secondary-30   w-fit">
<button 
class={["p-1 w-full flex items-center rounded-sm shadow-[0_0_1px_1px_rgba(0,0,0,0.1)]",
    showOptions && "rounded-b-none"
]}
onclick={_ => {showOptions = !showOptions}}>
 { value }
 <div class="flex-1"></div>
 <div class="rotate-180 w-0 h-0 mr-1 border-4 border-t-0 border-b-secondary-40 border-l-transparent border-r-transparent "></div>
</button>

<!-- used to compute the width -->
<div class="w-fit flex-col h-0 flex px-3.5 invisible">
    {@render children()}
</div>
{#if showOptions}
<div class="w-full flex-col flex bg-window-bg rounded-sm rounded-t-none overflow-hidden -z-1">
    <!-- <div class="w-full h-[1px] bg-black/10"></div> -->
        {@render children()}
</div>
{/if}
</div>
</div>


