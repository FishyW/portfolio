

<script lang="ts">
    import { fileSystem } from "$scripts/fs.svelte";
    import { dispatchClose } from "./WindowManager.svelte";
    import WindowTopBarDraggable from "./WindowTopBarDraggable.svelte";

</script>

<WindowTopBarDraggable>

    <div class="flex">
        <div class="w-4 h-4 bg-white hover:bg-gray-700" 
        onclick={() => fileSystem.back()}></div>
        <div class="flex-1"></div>
        <div class="w-4 h-4 bg-white hover:bg-gray-700" 
            onclick={ dispatchClose }
        ></div>     
    </div>

</WindowTopBarDraggable>
