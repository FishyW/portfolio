<script module lang="ts">
    
    
    export let tippyState = $state({on: false});

   import { pasteBuffer } from "$scripts/ui/operations.svelte";
   
</script>


<script lang="ts">
    import { DirectoryFile, type BaseFile } from "$scripts/ui/fs.svelte";
    import { menu, show } from "./ContextMenu.svelte";

    import ContextMenuFile from "./ContextMenuFile.svelte";
    import { onFileDrop } from "$scripts/ui/filedrop";
    import { offscreenBuffer } from "./Desktop.svelte";
    import WindowFileElementPopOver from "./WindowFileElementPopOver.svelte";
    

    
    import { hideOnEsc, tippy } from "$scripts/ui/tippy.svelte";
    import 'tippy.js/dist/tippy.css';
    
    import type { Instance, Props as TippyProps } from "tippy.js";


    import { fileOpen } from "$scripts/ui/operations.svelte";
    import { getIconAsync } from "$scripts/ui/icon_manager";
    import { getContext, tick } from "svelte";

    

    let tippyBox: HTMLElement;
    
  
    interface Props {
        file: BaseFile,
        selected: BaseFile | null
    }
    let { file, selected = $bindable()}: Props = $props();

    let popOverMode: "rename" | "mount" = $state("rename");

    export function getName() {
        return file.name;
    }

    let oncallback = (_name: string) => {};

    function callback(editedName: string) {
        oncallback(editedName);
    }

    export async function renamePrompt(): Promise<string> {
        popOverMode = "rename";
        
        tippyInstance?.show();
        return new Promise((res, _rej) => {
            oncallback = res;
        });
    }

    export async function mountPrompt(): Promise<string> {
        popOverMode = "mount";
        tippyInstance?.show();
       
        return new Promise((res, _rej) => {
            oncallback = res;
        });
    }

    
    export function update() {
        displayedName = file.name;
        iconURL = getIconAsync(file);
        tippyInstance?.hide();
    }

    let contextMenu: ReturnType<typeof ContextMenuFile>;
    let tippyInstance: Instance<TippyProps> | undefined = $state();
    let tippyOn = $state(false);

   
    let displayedName = $state(file.name);
    let fileElement: HTMLElement;
    let iconURL = $state(getIconAsync(file));

    function select() {
        selected = file;
        fileElement.focus();
        fileElement.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: "smooth" });
    }

    function deselect() {
        selected = null;
    }

    $effect(() => {
        pasteBuffer.file;
    });
   

    $effect(() => {
        selected;
        if (selected?.name === file.name) {
            fileElement.focus();
        }
            
    })
  
 
   let aboveDropZone = $state(false);


    let isBeingMoved = $derived(pasteBuffer.file?.path === file.path 
        && pasteBuffer.active && pasteBuffer.operation === "MOVE")

    let isDoubleClick = false;
    let isTippyClick = false;
    let disableOpen = false;
    let intermediateClick = false;
    let forceFocus = false;

    function onTippyHide() {
        tippyOn = false;
        
        if (selected?.name === file.name) {
            forceFocus = true;
            select();
        }
        tippyState.on = false;
    }

    const getWindow: () => HTMLElement = (getContext("windowElement") as any).getWindow;
 
</script>

<div class="h-fit w-fit ">

<div class="hidden">
    <ContextMenuFile {file} bind:this={contextMenu} />
</div>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div 
use:tippy={() => ({
    interactive: true,
    trigger: 'manual',
    appendTo: getWindow(),
    placement: "bottom",
    theme: "window",
    zIndex: 10,
    content: tippyBox,
    onCreate: (instance) => {
        tippyInstance = instance;
    },
    onShow: (instance) => {
        tippyOn = true;
        tippyState.on = true;
        // instance.popperInstance?.forceUpdate();
    },
    onHidden: (_) => {
        onTippyHide();
    },
    plugins: [hideOnEsc]
})}


tabindex="-1"
bind:this={fileElement}
draggable="true" 
class={["p-3 py-2 \
rounded-md \
hover:bg-slate-200 \
focus:bg-slate-300 \
h-42 overflow-hidden \
flex items-center flex-col outline-0",
tippyOn && "bg-slate-300 hover:bg-slate-300" ,
aboveDropZone && "dragging",
aboveDropZone && "bg-slate-300",

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
    if (isTippyClick) {
        disableOpen = true;
        intermediateClick = true;
        setTimeout(() => {disableOpen = false; intermediateClick = false}, 0);
    }
    isTippyClick = false;
    if (tippyState.on) {
        isTippyClick = true;
        return;
    }
    select();
})}

onmousedown={e => {
    isDoubleClick = false;
}}

onfocusin={(e => {

    if (forceFocus) {
        forceFocus = false;
        return;
    }
    if((tippyState.on && !isDoubleClick) || intermediateClick) {
        (e.target! as HTMLElement).blur();
        return;
    }
})}

ondblclick={() => {
    intermediateClick = false;
    isDoubleClick = true;
    select();
    if (disableOpen) {
        disableOpen = false;
        return;
    }
    fileOpen();
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
    isDoubleClick = false;

    e.preventDefault();
    if (menu.on) {
        return;
    }

    e.stopPropagation();
    if (tippyState.on) {
        return;
    }
    
    select();
    show(e, contextMenu);
}}
>   
        <div class="h-26 w-26 flex justify-center items-center p-2">
            {#await iconURL then url} 
                <img src={url} alt="file" 
            class={["h-full object-contain drop-shadow-sm", isBeingMoved && "brightness-90"]}/>
            {/await}
            
        </div>
        
        <div class="w-24 mt-1 h-fit">
            
            <div class="text-sm w-full text-center h-fit
            overflow-hidden line-clamp-2 
            overflow-ellipsis break-words"> 
                { displayedName } 
            </div>
            
            <div class="hidden">
                <div bind:this={tippyBox} class="w-fit">
                    <WindowFileElementPopOver {file} {tippyOn}
                        mode={popOverMode} {callback}  />
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

    :global(.tippy-box[data-theme~='window']) {
        background-color: var(--color-window-bg);
        color: var(--color-secondary-20);
        filter: drop-shadow(0px 0px 1px rgba(0,0,0,.5));
        @apply rounded-md;
    }
    


    :global(.tippy-box[data-theme~='window'] > .tippy-arrow::before) {
        filter: drop-shadow(0px -2px 1px rgba(128,128,128,.1));
    }
    :global(.tippy-box[data-theme~='window'][data-placement^='top'] > .tippy-arrow::before) {
        border-top-color: var(--color-window-bg);
    }
    :global(.tippy-box[data-theme~='window'][data-placement^='bottom'] > .tippy-arrow::before) {
        border-bottom-color: var(--color-window-bg);
    }
    :global(.tippy-box[data-theme~='window'][data-placement^='left'] > .tippy-arrow::before) {
        border-left-color: var(--color-window-bg);
    }
    :global(.tippy-box[data-theme~='window'][data-placement^='right'] > .tippy-arrow::before) {
        border-right-color: var(--color-window-bg);
    }
</style>