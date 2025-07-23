<script lang="ts">
    import { getContext } from "svelte";

    
    let { children } = $props();

    const ctx:  {window: HTMLElement | null } = getContext("window");

    let isDragging = true;
    let offset = {x: 0, y: 0};
    let currentTranslate = {x: 0, y: 0};
    // no need to make this reactive
    let mInit = { x: 0, y: 0 };
    let mNow = { x: 0, y: 0 };

    const DELTA = 5;

    let handler: number;

    function drag() {        
        
        if (isDragging) {

            if (mNow.x >= document.documentElement.clientWidth - DELTA 
                || mNow.y >= document.documentElement.clientHeight - DELTA 
                || mNow.x <= DELTA
                || mNow.y <= DELTA
            ) {
                handler = requestAnimationFrame(drag);
                return;
            }


            offset.x = mNow.x - mInit.x + currentTranslate.x;
            offset.y = mNow.y - mInit.y + currentTranslate.y;

            ctx.window!.style.translate = `${offset.x}px ${offset.y}px`;
            handler = requestAnimationFrame(drag);
        } else {
            currentTranslate.x = offset.x;
            currentTranslate.y = offset.y;
            cancelAnimationFrame(handler);
        }

    }
</script>



   <!-- Top bar -->
<div draggable=true 

ondrag = {e => {
    mNow.x = e.clientX;
    mNow.y = e.clientY;
}} 

ondragstart={e => {
    // propagate onclick
    
    mNow.x = e.clientX;
    mNow.y = e.clientY;

    mInit = structuredClone(mNow);
    requestAnimationFrame(drag);
    isDragging = true;

    e.dataTransfer!.setDragImage(document.createElement("div"), 0, 0);
    
    e.target!.dispatchEvent(new Event("click", {bubbles: true}));
}} 
ondragend={e => {
    isDragging = false;
        
}} class="w-full h-10 p-2 bg-black">

    {@render children()}
    
</div>
