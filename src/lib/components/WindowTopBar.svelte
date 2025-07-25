<script lang="ts">
    import { dispatchClose } from "./WindowManager.svelte";
    import WindowTopBarDraggable from "./WindowTopBarDraggable.svelte";
    import WindowTopBarIcon from "./WindowTopBarIcon.svelte";

    
    let { children }: {children?: any} = $props();
</script>

<WindowTopBarDraggable>
    <div class="flex w-full h-full items-center gap-1">
        <div class="flex-1">
            {@render children?.()}
        </div>

        <WindowTopBarIcon onclick={ dispatchClose } /> 
    </div>
</WindowTopBarDraggable>
