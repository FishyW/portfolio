<script module lang="ts">
    
    let fileToRename = $state("");
    
    export let tippy = $state({on: false});

    // this is a pretty ugly solution but I can't think of a better way
    export function renamePrompt(filename: string) {
        fileToRename = filename;
    }

    let fileUpdate = $state("");
    export function updateFile(filename: string) {
        fileUpdate = filename;
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

    import fileImageURL from "$icons/files/File.svg";
    import folderImageURL from "$icons/files/Folder.svg";


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
        fileElement.focus();
    }

    function deselect() {
        selected = null;
    }

    $effect(() => {
        pasteBuffer.file;
        fileElement?.blur();
    });

    // needed to manually update the file
    // since the file isn't reactive
    // one way is to give a reactive view of the file
    // but no way I'm doing that if this is a simpler solution
    let updateToggle = $derived(fileUpdate === file.name);

    $effect(() => {
        updateToggle;
        // note that I have to use a variable
        // apparently objects are slower to update
        // so I can't just update an object called fileDetails 
        // when file.name changes
        displayedName = file.name;
        fileUpdate = "";
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
            updateToggle = !updateToggle;
        } catch(e) {
            console.error(e);
            return;
        }
        tippyInstance?.hide();
    }

    function mountPrompt() {
        showMountInputBox = true;
    }

    async function mountCallback(mountPath: string) {
        try {
            await mount(mountPath);
        } catch(e) {
            console.error(e);
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

<div class="h-fit w-fit ">
 
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
class={["p-3 py-2 h-fit \
rounded-md \
hover:bg-slate-200 \
focus:bg-slate-300 \
h-42 overflow-hidden \
flex items-center flex-col outline-0",
tippyOn && "bg-slate-300" ,
aboveDropZone && "dragging",
aboveDropZone && "bg-slate-300",
pasteBuffer.file?.path === file.path 
    && pasteBuffer.active && "bg-slate-300"
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

onfocusin={(e => {
    if(tippy.on) {
        (e.target! as HTMLElement).blur();
    }
})}

ondblclick={() => {
    file.open();
    deselect();
    fileElement.blur();
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
    deselect();
    fileElement.blur();

    if (!DirectoryFile.isDirectory(file)) {
        return;
    }
    e.stopPropagation();

    e.preventDefault();
    onFileDrop(e.dataTransfer!.items, file);
    
}}

ondragover = {e => {
    e.preventDefault();
    deselect();
    fileElement.blur();
}}

oncontextmenu={e => {
    e.preventDefault();
    e.stopPropagation();
    select();
    show(e, contextMenu);
}}
>   
        <div class="h-26 w-26 flex justify-center items-center p-2">
            {#if DirectoryFile.isDirectory(file)}
            <img src={folderImageURL} alt="folder" class="h-full object-contain drop-shadow-sm"/>
            {:else }
                <img src={fileImageURL} alt="file" class="h-full object-contain drop-shadow-sm"/>
            {/if}

        </div>
        
        <div class="w-24 mt-1 h-fit">
            
            <div class="text-sm w-full text-center h-fit
            overflow-hidden line-clamp-2 
            overflow-ellipsis break-words"> 
                { displayedName } 
            </div>
   
            
            <div class="hidden">
                <div bind:this={tippyBox}>
                    <WindowFileElementPopOver filename={displayedName} {tippyOn} {mountCallback}
                     {renameCallback} mode={popOverMode} />
                </div>
            </div>
           
            
            
        </div>
</div>
   
</div>

<style>
    @import "tailwindcss";

    img {
        /* height: initial; */
        /* min-width: 100%; */
    }
   

    .dragging * {
        pointer-events: none;
    }
</style>