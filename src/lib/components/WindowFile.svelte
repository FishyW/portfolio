
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

    let exit = $state(() => {});
    let contextMenu: ReturnType<typeof ContextMenuFile>;
    
</script>

<div class="hidden">
    <ContextMenuFile bind:this={contextMenu} />
</div>

<script lang="ts">
    import { BaseFile, fileSystem } from "$scripts/ui/fs.svelte";
    import { show } from "./ContextMenu.svelte";
    import FileElement from "./WindowFileElement.svelte";
    import ContextMenuFile from "./ContextMenuFile.svelte";
    import WindowTopBarFile from "./WindowTopBarFile.svelte";
    import { copy, move, paste, rename, removeFile } from "$scripts/ui/operations.svelte";
    import { onFileDrop } from "$scripts/ui/filedrop";
    import { tippy } from "./WindowFileElement.svelte";

    function deselect() {
        if (tippy.on) {
            return;
        }
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


<div class="h-full flex flex-col">
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


class="flex-1 flex flex-wrap px-8 py-6
content-start overflow-y-auto outline-0 gap-4" 
oncontextmenu={e => {
    e.preventDefault();
    deselect();
    show(e, contextMenu);
}}>


<!-- <div class="w-20 h-20 bg-black p-4"> -->
	
<!-- </div> -->
{#each fileSystem.cwd.files as file (file.path)}
    
    <FileElement {file} bind:selected={selected.file} />
{/each}
</div>
</div>

