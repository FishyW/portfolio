<script module lang="ts">
    import { fade } from "svelte/transition";
    import ContextMenuFile from "./ContextMenuFile.svelte";
    import { cubicOut } from "svelte/easing";


    export let menu = $state({on: false});
    let child: null | HTMLElement = null;

     // svelte-ignore non_reactive_update
    let pos = $state({ x: 0, y: 0 })
    let menuDim = { h: 0, w: 0 }
    // browser/window dimension (height and width)
    let browser = { h: 0, w: 0 }


    function storeMousePosition(e: MouseEvent) {
        pos = {
            x: e.clientX,
            y: e.clientY
        };
    }

    // call this after a mouse event
    // component is the ContextMenu component to render
    export function show(e: MouseEvent, elem: ReturnType<typeof ContextMenuFile>) {
        menu.on = true;
        
        storeMousePosition(e);
        child = elem.getChild();
        elem.setExit(exit);
        elem.update();
    }

    // pos is cursor position when right click occur

   

    const DELTA = 1;

    

    // credit to
    // https://svelte.dev/playground/6fb90919e24942b2b47d9ad154386b0c?version=3.49.0
    function setMenuPosition(node: HTMLElement){

        let height = node.offsetHeight
        let width = node.offsetWidth
        menuDim = {
            h: height,
            w: width
        }
        
        browser = {
            w: window.innerWidth,
            h: window.innerHeight
        };
        
        if (browser.h - pos.y >= menuDim.h && browser.w -  pos.x >= menuDim.w) {
            pos.x += DELTA;
        }

        // If bottom part of context menu will be displayed
        // after right-click, then change the position of the
        // context menu. This position is controlled by `top` and `left`
        // at inline style. 
        // Instead of context menu is displayed from top left of cursor position
        // when right-click occur, it will be displayed from bottom left.
        if (browser.h -  pos.y < menuDim.h)
            pos.y = pos.y - menuDim.h;

        if (browser.w -  pos.x < menuDim.w)
            pos.x = pos.x - menuDim.w;
        
    }


     function onContextMenuMount(node: HTMLElement){
        // This function will get context menu dimension
        // when navigation is shown => showMenu = true


        if (child === null) {
            throw new Error("No child!")
        }
        node.replaceChildren(child);
        setMenuPosition(node);
        child = null;
    }


    function exit() {
        menu.on = false;
    }
</script>


<svelte:window 

oncontextmenu={exit}

onmousedown={e => {
    if (e.button === 2) {
        return;
    }
    exit();
}} 
onkeydown={(e => {
    if (e.key === "Escape") {
        exit()
    }
})}

/>


{#if menu.on}
<div 
    in:fade={{ duration: 200, delay: 0, easing: cubicOut }}
    onmousedown={e => {
        e.stopImmediatePropagation();
    }}
    class="fixed z-50 rounded-xl bg-window-bg shadow-[0_0_3px_3px_rgba(0,0,0,0.1)]" 
    style:top="{pos.y}px"  
    style:left="{pos.x}px"
    use:onContextMenuMount
    oncontextmenu={e => e.preventDefault()}   
    onclick={e => e.stopPropagation()} 
>
</div>
{/if}