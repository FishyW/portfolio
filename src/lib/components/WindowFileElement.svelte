<script module lang="ts">
    
    let fileToRename = $state("");
    
    export let tippy = $state({on: false});

    // this is a pretty ugly solution but I can't think of a better way
    export function renamePrompt(filename: string) {
        fileToRename = filename;
    }

   import { pasteBuffer } from "$scripts/ui/operations.svelte";
   
</script>


<script lang="ts">
    import { DirectoryFile, type BaseFile } from "$scripts/ui/fs.svelte";
    import { show } from "./ContextMenu.svelte";

    import ContextMenuFile from "./ContextMenuFile.svelte";
    import { onFileDrop } from "$scripts/ui/filedrop";
    import { offscreenBuffer } from "./Desktop.svelte";
    import WindowFileElementPopOver from "./WindowFileElementPopOver.svelte";

    import 'tippy.js/dist/tippy.css';
    import { hideOnEsc, tooltip } from "$scripts/ui/tippy.svelte";
    import type { Instance, Props as TippyProps } from "tippy.js";
    import { mount } from "$scripts/ui/operations.svelte";

    let tippyBox: HTMLElement;

  
    interface Props {
        file: BaseFile,
        selected: BaseFile | null
    }
    let { file, selected = $bindable() }: Props = $props();
  

    let showRenameInputBox = $derived(
        fileToRename === file.name
    );

    let showMountInputBox = $state(false);
   
    let displayedName = $state(file.name);
    let fileElement: HTMLElement;


    function select() {
        if (tippy.on) {
            return;
        }
        selected = file;
    }

    $effect(() => {
        pasteBuffer.file;
        fileElement?.blur();
    })


    $effect(() => {
        selected;
        if (selected?.name === file.name)
            fileElement.focus();
    })

    function onTippyHide() {
        tippyOn = false;
        fileToRename = "";
        showMountInputBox = false;
        tippy.on = false;
        fileElement.focus();
    }
  
 
   let aboveDropZone = $state(false);


    function renameCallback(editedName: string) {
        try {
            file.rename(editedName);
            displayedName = file.name;
        } catch(e) {
            return;
        }
        tippyInstance?.hide();
    }

    function mountPrompt() {
        showMountInputBox = true;
    }

    function mountCallback(mountPath: string) {
        try {
            mount(mountPath);
        } catch(e) {
            return;
        }
        tippyInstance?.hide();
    }
    

    let contextMenu: ReturnType<typeof ContextMenuFile>;
    let tippyInstance: Instance<TippyProps> | undefined = $state();
    let tippyOn = $state(false);


    $effect(() => {
        if (showRenameInputBox || showMountInputBox) {
            tippyInstance?.show();
        } else {
            tippyInstance?.hide();
        }
    })

    let popOverMode: 'rename' | 'none' | 'mount' = $derived(
        showRenameInputBox ? 'rename' :
        showMountInputBox ? 'mount'
        : 'none'
    ) 


</script>

<div class="hidden">
    <ContextMenuFile  mountCallback={mountPrompt} {file} bind:this={contextMenu} />
</div>


<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div 
use:tooltip={() => ({
    interactive: true,
    trigger: 'manual',
    appendTo: document.body,
    placement: "bottom",
    content: tippyBox,
    onCreate: (instance) => {
        tippyInstance = instance;
    },
    onShow: (_) => {
        tippyOn = true;
        tippy.on = true;
    },
    onHidden: (_) => {
        onTippyHide();
    },
    plugins: [hideOnEsc]
})}


tabindex="-1"
bind:this={fileElement}
draggable="true" 
class={["w-32 p-4 \
hover:bg-gray-500 \
focus:bg-gray-500 \
h-42 overflow-hidden \
flex items-center flex-col outline-0",
tippyOn && "bg-gray-500",
aboveDropZone && "dragging",
pasteBuffer.file?.path === file.path 
    && pasteBuffer.active && "bg-gray-400"
]}

ondragstart={
    e => {
        select();
        e.dataTransfer!.dropEffect = "move";
        e.dataTransfer!.setData("text/plain", file.name);

        const elem = fileElement.cloneNode(true) as HTMLElement;
        if (offscreenBuffer.element == null) {
            return;
        }
        // elem.style.backgroundColor = "green";
        offscreenBuffer.element.replaceChildren(elem);
        const rect = fileElement.getBoundingClientRect();
        
        e.dataTransfer!.setDragImage(elem, e.clientX - rect.left, e.clientY - rect.top);
    }
}

onclick={(e => {
    select();
})}



ondblclick={() => {
    select();
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

    e.preventDefault();
    onFileDrop(e.dataTransfer!.items, file);
    
}}

ondragover = {e => {
    e.preventDefault();
}}

oncontextmenu={e => {
    e.preventDefault();
    e.stopPropagation();
    select();
    show(e, contextMenu);
}}
>
        <div class="aspect-square w-full bg-black"></div>

        <div class="w-full mt-1 h-[3.0em]">
            
           
            <div class="w-full text-center h-full overflow-hidden line-clamp-2 overflow-ellipsis break-words"> 
                { displayedName } 
            </div>
   
            
            <div class="hidden">
                <div bind:this={tippyBox}>
                    <WindowFileElementPopOver filename={file.name} {tippyOn} {mountCallback}
                     {renameCallback} mode={popOverMode} />
                </div>
            </div>
           
            
            
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