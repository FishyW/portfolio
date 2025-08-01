<script lang="ts">
    import { dispatchClose } from "./WindowManager.svelte";
    import WindowTopBarDraggable from "./WindowTopBarDraggable.svelte";
    import WindowTopBarIcon from "./WindowTopBarIcon.svelte";

    
    let { children = undefined, 
        onexit = undefined,
        content="",
        ondragstart = () => {},
        ondragend = () => {} } = $props();

</script>

<WindowTopBarDraggable {ondragend} {ondragstart}  >
    <div class="flex w-full h-full items-center gap-1 relative ">
        <div class="absolute top-0 w-full h-full flex items-center -z-10">
            <div class="text-center select-none w-full">
                {content}
            </div>
        </div>
        <div class="flex-1">
            {@render children?.()}
        </div>

        <WindowTopBarIcon onclick={e => {
            onexit?.();
            dispatchClose(e);
        }} /> 
    </div>
</WindowTopBarDraggable>
