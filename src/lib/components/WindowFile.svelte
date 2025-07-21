
<script module lang="ts">
    import type { Setting } from "./WindowManager.svelte";

    export const setting: Setting = {
        id: "FileManager",
        hasBack: true
    };

</script>

<script lang="ts">
    import { fileSystem } from "$scripts/fs.svelte";
    import { show } from "./WindowFileContextMenu.svelte";
    import FileElement from "./WindowFileElement.svelte";
    import type { Component } from "svelte";

    export function backHandler(e: MouseEvent) {
        fileSystem.back();
    }

    let wrapper = $derived(fileSystem
        .cwd.files.map(file => {
        return {
                file, 
                component: null
        }})
    );

    // bind an array to an each block
    // no clue why this isn't documented
    let _refs: ReturnType<Component>[] = $state([])
    let refs = $derived(_refs.filter(Boolean))
</script>



<div 
class="w-[50vw] h-[80vh] flex flex-wrap p-4 content-start gap-4 overflow-y-auto" 
oncontextmenu={e => {
    e.preventDefault();
    show(e);
}}>
<div class="w-full m-0">{fileSystem.cwd.path}</div>
    {#each wrapper as item, i (item)}
        <FileElement file={item.file} bind:this={_refs[i]} componentThis={refs[i]} />
    {/each}
    <!-- { console.log(defaultDirectory) } -->
</div>