<script module lang="ts">
    import ContextMenuFile from "./ContextMenuFile.svelte";

    let shown = $state(false);

    let contextMenuDiv: HTMLElement;

    // call this after a mouse event
    // component is the ContextMenu component to render
    export function show(e: MouseEvent, elem: ReturnType<typeof ContextMenuFile>) {
        rightClickContextMenu(e);
        shown = !shown;
        
        const child = elem.getChild();
        elem.setExit(exit);
        elem.update();
        contextMenuDiv.replaceChildren(child);
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


    function exit() {
        shown = false;
    }
</script>


<svelte:window 

onmousedown={exit} 
onkeydown={(e => {
    if (e.key === "Escape") {
        exit()
    }
})}

/>

<div bind:this={contextMenuDiv}
    onmousedown={e => {
        e.stopImmediatePropagation();
        e.preventDefault()
    }}
    class="fixed z-50" 
    style:display = {shown ? "block" : "none"}
    style:top="{pos.y}px"  
    style:left="{pos.x}px"
    use:getContextMenuDimension
    oncontextmenu={e => e.preventDefault()}   
    onclick={e => e.stopPropagation()} 
>
</div>
