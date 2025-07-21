<script module lang="ts">
    import { BaseFile, DirectoryFile } from '$scripts/fs.svelte';

    import { invokeRename } from './WindowFileElement.svelte';

    let shown = $state(false);

    type Operation = "MOVE" | "COPY";

    type PasteBuffer = { file?: BaseFile, operation?:  Operation };

    export let pasteBuffer: PasteBuffer = $state({});
    
    // svelte-ignore non_reactive_update
    let selectedFile: undefined | BaseFile;
    let fileComponent: undefined | ReturnType<typeof WindowFileElement>;

    export function show(e: MouseEvent, file?: BaseFile, component?: ReturnType<typeof WindowFileElement>) {
        shown = !shown;
        rightClickContextMenu(e);
        selectedFile = file;
        fileComponent = component;
    }


    // pos is cursor position when right click occur

    // svelte-ignore non_reactive_update
    let pos = { x: 0, y: 0 }
    let menu = { h: 0, w: 0 }
    // browser/window dimension (height and width)
    let browser = { h: 0, w: 0 }


    const DELTA = 1;

    // credit to
    // https://svelte.dev/playground/6fb90919e24942b2b47d9ad154386b0c?version=3.49.0
    function rightClickContextMenu(e: MouseEvent){
        browser = {
            w: window.innerWidth,
            h: window.innerHeight
        };
        pos = {
            x: e.clientX,
            y: e.clientY
        };

        if (browser.h - pos.y >= menu.h && browser.w -  pos.x >= menu.w) {
            pos.x += DELTA;
        }
        // If bottom part of context menu will be displayed
        // after right-click, then change the position of the
        // context menu. This position is controlled by `top` and `left`
        // at inline style. 
        // Instead of context menu is displayed from top left of cursor position
        // when right-click occur, it will be displayed from bottom left.
        if (browser.h -  pos.y < menu.h)
            pos.y = pos.y - menu.h;

        if (browser.w -  pos.x < menu.w)
            pos.x = pos.x - menu.w;
    }


     function getContextMenuDimension(node: HTMLElement){
        // This function will get context menu dimension
        // when navigation is shown => showMenu = true
        let height = node.offsetHeight
        let width = node.offsetWidth
        menu = {
            h: height,
            w: width
        }
    }
</script>

<script>
    import { fileSystem } from "$scripts/fs.svelte";
    import WindowFileElement from './WindowFileElement.svelte';
</script>

<svelte:window 
onclick={() => shown = false} 
onkeydown={(e => {
    if (e.key === "Escape") {
        shown = false;
    }
})}

/>

{#if shown}
    <div 
        class="fixed bg-green-500 w-48 h-48 z-50" 
        style:top="{pos.y}px"  
        style:left="{pos.x}px"
        use:getContextMenuDimension
        oncontextmenu={e => e.preventDefault()}   
        onclick={e => e.stopPropagation()} 
    >
    <ul>
        <li class="hover:bg-green-400 select-none" 
        onclick={() => {
            shown = false;
            const file = fileSystem.addEmptyFile();
            invokeRename(file.name);
        }}>New File</li>

        <li class="hover:bg-green-400 select-none"
        onclick={() => {
            shown = false;
            const folder = fileSystem.addEmptyFolder();
            invokeRename(folder.name);
        }}
        >New Folder</li>

       

        {#if selectedFile }
            <li
                onclick={() => {
                 shown = false;
                fileSystem.removeFile(selectedFile!);
            }}
                class="hover:bg-green-400 select-none">Remove
            </li>

             <li class="hover:bg-green-400 select-none"
                onclick={() => {
                    shown = false;
                    fileComponent?.invokeRename();
                }}>Rename
                </li>

            
             <li class="hover:bg-green-400 select-none"
                onclick={() => {
                    shown = false;
                  
                    // prevent reassignment
                    pasteBuffer.file = selectedFile!;
                    pasteBuffer.operation = "COPY";

                }}>Copy
                </li>

                <li class="hover:bg-green-400 select-none"
                onclick={() => {
                    shown = false;
                  
                    // prevent reassignment
                    pasteBuffer.file = selectedFile!;
                    pasteBuffer.operation = "MOVE";

                }}>Move
                </li>
             
        {/if}

        {#if pasteBuffer.file !== undefined}
            <li class="hover:bg-green-400 select-none"
                    onclick={() => {
                        const targetDir = (selectedFile && DirectoryFile.isDirectory(selectedFile)) 
                            ? selectedFile : fileSystem.cwd;
                        shown = false;
                        
                        if (targetDir.path === pasteBuffer.file!.parent?.path 
                            && pasteBuffer.operation === "MOVE") {
                            pasteBuffer.file = undefined;
                            return;
                        }
                        

                        if (pasteBuffer.operation === "COPY") {
                            fileSystem.copy(pasteBuffer.file!, targetDir);
                        } else if (pasteBuffer.operation === "MOVE") {
                            fileSystem.move(pasteBuffer.file!, targetDir);
                        }
                    
                        
                        pasteBuffer.file = undefined;
                        
                    }}>Paste
            </li>
        {/if}
    </ul>
</div>
{/if}