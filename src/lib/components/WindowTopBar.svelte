<script lang="ts">
    import { dispatchClose } from "./WindowManager.svelte";
    import WindowTopBarDraggable from "./WindowTopBarDraggable.svelte";
    import closeImage from "$icons/symbols/cross-small-symbolic.svg"

    
    let { children = undefined, 
        onexit = undefined,
        content="",
        ondragstart = () => {},
        ondragend = () => {} } = $props();

</script>


<WindowTopBarDraggable {ondragend} {ondragstart}  >
    <div class="flex w-full h-full items-center gap-1 relative ">
        <div class="absolute top-0 w-full h-full flex items-center -z-10">
            <div class="text-center w-full">
                {content}
            </div>
        </div>

        
        <div class="flex-1 overflow-hidden">
            {@render children?.()}
        </div>

        <button class="w-6 h-6 
        p-1
        rounded-full
        text-xs 
        justify-center items-center 
        whitespace-nowrap flex
        hover:bg-slate-200" 
        onclick={e => {
            onexit?.();
            dispatchClose(e);
        }}>
            <img src={closeImage} alt="close"/>
        </button>  

    </div>
</WindowTopBarDraggable>
