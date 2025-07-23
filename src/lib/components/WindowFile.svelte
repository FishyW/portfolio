
<script module lang="ts">
    export let selected: {file: null | BaseFile} = $state({file: null});
</script>

<script lang="ts">
    import { BaseFile, fileSystem } from "$scripts/fs.svelte";
    import { show } from "./ContextMenu.svelte";
    import FileElement from "./WindowFileElement.svelte";
    import ContextMenuFile from "./ContextMenuFile.svelte";
    import WindowTopBarFile from "./WindowTopBarFile.svelte";

    // all windows need to export this unique ID
    // will be used by the window manager to 
    // figure out 
    export const ID = "File";

   

    // let wrapper = $derived(fileSystem
    //     .cwd.files.map(file => {
    //     return {
    //             file, 
    //             component: null
    //     }})
    // );

    // bind an array to an each block
    // no clue why this isn't documented
    // for now not used
    // let _refs: ReturnType<Component>[] = $state([])
    // let refs = $derived(_refs.filter(Boolean))

    function deselect() {
        selected.file = null;
    }

    $inspect(selected);
</script>

<div class="w-[50vw]">
<WindowTopBarFile />
<div 
onclickcapture={deselect}
ondblclickcapture={deselect}
class="h-[80vh] flex flex-wrap p-4  content-start gap-4 overflow-y-auto" 
oncontextmenu={e => {
    e.preventDefault();
    deselect();
    show(e, ContextMenuFile);
}}>

{#each fileSystem.cwd.files as file (file.path)}
    <FileElement {file} fileselect={() => selected.file = file} />
{/each}
</div>
</div>

