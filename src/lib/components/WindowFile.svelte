
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

    let contextMenu: ReturnType<typeof ContextMenuFile>;
    


</script>

<div class="hidden">
    <ContextMenuFile bind:this={contextMenu} />
</div>

<script lang="ts">
    import { BaseFile, fileSystem } from "$scripts/ui/fs.svelte";
    import { menu, show } from "./ContextMenu.svelte";
    import FileElement from "./WindowFileElement.svelte";
    import ContextMenuFile from "./ContextMenuFile.svelte";
    import WindowTopBarFile from "./WindowTopBarFile.svelte";
    import { copy, move, paste, rename, removeFile, fileOpen } from "$scripts/ui/operations.svelte";
    import { onFileDrop } from "$scripts/ui/filedrop";
    import { tippy } from "./WindowFileElement.svelte";
    import WindowFileDialog from "./WindowFileDialog.svelte";
    import WindowFileDropOverlay from "./WindowFileDropOverlay.svelte";


    let showDropOverlay = $state(false);

    function deselect() {
        if (tippy.on) {
            return;
        }
        selected.file = null;
    }

    function selectOffset(offset:number) {
        const selectedFile = selected.file;
        if (selectedFile == null) {
            return;
        }
        const files = fileSystem.cwd.files;
        const idx = files.findIndex(file => file.name === selectedFile.name);
        const newIdx = idx + offset;
        if (newIdx < 0 || newIdx >= files.length) {
            return;
        }
        selected.file = files[newIdx];
    }

    function getRowCount() {
        return getComputedStyle(windowElement).gridTemplateColumns.split(" ").length;
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
            } else if (e.key === "ArrowRight") {
                selectOffset(1);
            } else if (e.key === "ArrowLeft") {
                selectOffset(-1);
            } else if (e.key === "ArrowUp") {
                selectOffset(-getRowCount());
            } else if (e.key === "ArrowDown") {
                selectOffset(getRowCount());
            } else if (e.key === "Enter") {
                fileOpen();
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

<div class="h-full flex flex-col relative">
<WindowFileDialog />
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
        showDropOverlay = true;
    });
    
}}

ondragleave={e => {
    showDropOverlay = false;
}}

ondragover={e => {
    e.preventDefault();
    if (!showDropOverlay) {
        showDropOverlay = true;
    }
}}

ondrop={e => {
    e.preventDefault();
    onFileDrop(e.dataTransfer!.items, fileSystem.cwd);
    showDropOverlay = false;
}}


class="flex-1 px-8 py-6 overflow-y-auto outline-0 
grid gap-4 justify-items-center content-start relative
grid-cols-[repeat(auto-fill,_minmax(128px,_1fr))]" 
oncontextmenu={e => {
    e.preventDefault();
    if (menu.on) {
        return;
    }
    e.stopPropagation();
    deselect();
    show(e, contextMenu);
    return;
}}>

<!-- <div class="w-20 h-20 bg-black p-4"> -->
	
<!-- </div> -->
{#if !showDropOverlay}
{#each fileSystem.cwd.files as file (file.path)}
    <FileElement {file} bind:selected={selected.file} />
{/each}

{:else}
<WindowFileDropOverlay />
{/if}

</div>
</div>

