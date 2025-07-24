<script module lang="ts">

    let fileToRename = $state("");
    

    export function renamePrompt(filename: string) {
        fileToRename = filename;
    }

   import { pasteBuffer } from "$scripts/operations.svelte";
   
</script>


<script lang="ts">
    import { DirectoryFile, fileSystem, type BaseFile } from "$scripts/fs.svelte";
    import { show } from "./ContextMenu.svelte";

    import ContextMenuFile from "./ContextMenuFile.svelte";
    import { onFileDrop } from "$scripts/fsdropapi";

    interface Props {
        file: BaseFile,
        selected: BaseFile | null
    }
    let { file, selected = $bindable() }: Props = $props();
  

    let showRenameInputBox = $derived(
            fileToRename === file.name
        );

    // svelte-ignore non_reactive_update 
    let inputBox: HTMLElement;

   
    let editedName = $state(file.name);
    let fileElement: HTMLElement;

    $effect(() => {
        pasteBuffer.file;
        fileElement?.blur();
    })


    $effect(() => {
        selected;
        if (selected?.name === file.name)
            fileElement.focus();
    })

   

    function inputMount(node: HTMLInputElement) {
        $effect(() => {
            node.focus();
            node.setSelectionRange(0, node.value.lastIndexOf("."));
        })
    }
 
   let aboveDropZone = $state(false);

   

   function rename(revert: boolean) {
        try {
            file.rename(editedName);
        } catch(error) {
            if (!revert) {
                return;
            }
        }
        fileToRename = ""; 
   }



</script>


<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div 
tabindex="0"
bind:this={fileElement}
draggable="true" 
class={["w-32 p-4 \
hover:bg-gray-500 \
focus:bg-gray-500 \
h-42 overflow-hidden \
flex items-center flex-col",
aboveDropZone && "dragging",
pasteBuffer.file?.path === file.path 
    && pasteBuffer.active && "bg-gray-400"
]}

ondragstart={
    e => {
        selected = file;
        e.dataTransfer!.dropEffect = "move";
        e.dataTransfer!.setData("text/plain", file.name);
    }
}

onclick={(() => {
    selected = file;
})}

ondblclick={() => {
    selected = file;
    file.open();
}}

ondragleave = {() =>
    aboveDropZone = false
}

ondragenter = {e =>  {
   
    if (!DirectoryFile.isDirectory(file)) {
        return;
    }

    aboveDropZone = true;
}}

ondrop = {e => {
    aboveDropZone = false;
    if (!DirectoryFile.isDirectory(file)) {
        return;
    }
    e.stopPropagation();

    if (e.dataTransfer!.files.length !== 0) {
        e.preventDefault();
        onFileDrop(e.dataTransfer!.items, file);
        return;
    }
    const filename = e.dataTransfer!.getData("text/plain");
    const selectedFile = fileSystem.getFile(filename);
    if (selectedFile.name === file.name) {
        return;
    }

    // move the selected file to the directory
    fileSystem.move(selectedFile, file);
}}

ondragover = {e => {
    e.preventDefault();
}}

oncontextmenu={e => {
    e.preventDefault();
    e.stopPropagation();
    selected = file;
    show(e, ContextMenuFile, {selectedFile: file});
}}
>
        <div class="aspect-square w-full bg-black"></div>

        <div class="w-full mt-1 h-[3.0em]">
            {#if !showRenameInputBox }
            <div class="w-full text-center h-full overflow-hidden line-clamp-2 overflow-ellipsis break-words"> { file.name } </div>
            {:else}
            <input 
            class="w-full"
            onfocusout={() => rename(true)}

            onkeydown={e => {
                if (e.key === 'Enter') {
                    rename(false)
                } else if (e.key === "Escape") {
                    fileToRename = "";

                }
            }}
             use:inputMount bind:this={inputBox} type="text" bind:value={editedName} />
            {/if}
        </div>
</div>

<style>
    @import "tailwindcss";
    
    .dragging {
        @apply bg-gray-500;
    }

    .dragging * {
        pointer-events: none;
    }
</style>