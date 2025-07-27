
<script module lang="ts">
    

    export let selected: {file: null | BaseFile} = $state({file: null});
    let windowElement: HTMLElement;

    export function focus() {
        windowElement.focus({preventScroll: true});
    }

    // bind an array to an each block
    // no clue why this isn't documented
    // for now not used
    // let _refs: ReturnType<>[] = $state([])
    // let refs = $derived(_refs.filter(Boolean))

    
</script>

<script lang="ts">
    import { BaseFile, fileSystem } from "$scripts/ui/fs.svelte";
    import { show } from "./ContextMenu.svelte";
    import FileElement from "./WindowFileElement.svelte";
    import ContextMenuFile from "./ContextMenuFile.svelte";
    import WindowTopBarFile from "./WindowTopBarFile.svelte";
    import { copy, move, paste, rename, removeFile } from "$scripts/ui/operations.svelte";
    import { onFileDrop } from "$scripts/ui/filedrop";


    function deselect() {
        selected.file = null;
    }


    function bindShortcuts(node: HTMLElement) {
        function bindKeys(e: KeyboardEvent) {
            if (e.ctrlKey && e.key === "c") {
                copy();
            } else if (e.ctrlKey && e.key === "x") {
                move();
            } else if (e.ctrlKey && e.key === "v") {
                paste();
            } else if (e.key === "F2") {
                rename();
            } else if (e.key === "Delete") {
                removeFile();
            }
        }

        $effect(() => {
            node.addEventListener("keydown", bindKeys);
            return () => node.removeEventListener("keydown", bindKeys);
        })
    }

    // listen to changes in path
    $effect(() => {
        fileSystem.cwd.path;
        focus();
    })
</script>

<div class="w-[50vw]">
<WindowTopBarFile />

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div 
bind:this={windowElement}
tabindex="-1"
use:bindShortcuts
onclickcapture={deselect}
ondblclickcapture={deselect}
ondragenter={e => {
    [...e.dataTransfer!.items].forEach(file => {
        if (file.kind !== "file") {
            return;
        }

    });
    
}}

ondragover={e => {
    e.preventDefault();
}}

ondrop={e => {
    e.preventDefault();
    onFileDrop(e.dataTransfer!.items, fileSystem.cwd);
}}


class="h-[80vh] flex flex-wrap p-4 content-start overflow-y-auto" 
oncontextmenu={e => {
    e.preventDefault();
    deselect();
    show(e, ContextMenuFile);
}}>
<div>
    
</div>
{#each fileSystem.cwd.files as file (file.path)}
    
    <FileElement {file} bind:selected={selected.file} />
{/each}
</div>
</div>

