<script module>
    export let fileRename = $state("");


    let fileToBeRenamed = $state("");

    export function renamePrompt(filename: string) {
        fileToBeRenamed = filename;
    }

   
</script>


<script lang="ts">
    import { DirectoryFile, fileSystem, type BaseFile } from "$scripts/fs.svelte";
    import { show } from "./ContextMenu.svelte";

    import ContextMenuFile, { pasteBuffer } from "./ContextMenuFile.svelte";

    interface Props {
        file: BaseFile
    }
    let { file }: Props = $props();
    

    let renaming = $state(false);
    // svelte-ignore non_reactive_update 
    let inputBox: HTMLElement;

   
    let name = $state(file.name);

    $effect(() => {
        if (fileToBeRenamed === file.name) {
            fileToBeRenamed = "";
            renaming = true;
        }
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
        file.rename(name);
    } catch(error) {
        if (!revert) {
            return;
        }
    }
     renaming = false;
     name = file.name;
   }
 
</script>


<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div 
tabindex="0"
draggable="true" 
class={["h-fit p-4 \
hover:bg-gray-500 \
focus:bg-gray-500 \
flex items-center flex-col \
overflow-ellipsis overflow-hidden",
aboveDropZone && "dragging",
pasteBuffer.file?.path === file.path && "bg-gray-400"
]}

ondragstart={
    e => {
        e.dataTransfer!.dropEffect = "move";
        e.dataTransfer!.setData("text/plain", file.name);
    }
}

ondblclick={() => {
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
    if (!DirectoryFile.isDirectory(file)) {
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
    show(e, ContextMenuFile, {selectedFile: file, renameCallback: () => {
        renaming = true;
    }
    });
}}
>
        <div class="h-20 w-20 bg-black"></div>

        <div class="w-20">
            {#if !renaming }
            <div> { file.name } </div>
            {:else}
            <input 
            onfocusout={() => rename(true)}

            onkeydown={e => {
                if (e.key === 'Enter') {
                    rename(false)
                }
            }}
             use:inputMount bind:this={inputBox} type="text" bind:value={name} />
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