<script lang="ts">
    import { dispatchClose } from "./WindowManager.svelte";
    import WindowTopBarDraggable from "./WindowTopBarDraggable.svelte";
</script>

<WindowTopBarDraggable>
    <div class="flex w-full h-full items-center">
        <div class="flex-1"></div>
        <div class="w-4 h-4 bg-white hover:bg-gray-700" 
            onclick={ dispatchClose }
        ></div>    
    </div>
</WindowTopBarDraggable>
