<script lang="ts">
    import { getContext } from "svelte";

    let { children, ondragstart, ondragend } = $props();

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
        
        if (isDragging && ctx.window !== null) {

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

            ctx.window.style.translate = `${offset.x}px ${offset.y}px`;
            handler = requestAnimationFrame(drag);
        } else {
            currentTranslate.x = offset.x;
            currentTranslate.y = offset.y;
            cancelAnimationFrame(handler);
        }

    }
</script>



<svelte:body onmousemove={e =>{
    e.preventDefault();
    if (isDragging) {
        mNow.x = e.clientX;
        mNow.y = e.clientY;
    }
}}

onmouseup={e => {
    e.preventDefault();
    if (isDragging) {
        ondragend();
        isDragging = false;
    }
}} 
/>

   <!-- Top bar -->
<div 

onmousedown={e => {
    // not a left click
    if (e.button !== 0) {
        return;
    }
    e.preventDefault();
    ondragstart();
    // propagate onclick
    mNow.x = e.clientX;
    mNow.y = e.clientY;

    mInit = structuredClone(mNow);
    requestAnimationFrame(drag);
    isDragging = true;

    
    e.target!.dispatchEvent(new Event("click", {bubbles: true}));
}} 

class="w-full h-12 p-2 shadow-sm/5 z-10 relative">

    {@render children()}
    
</div>
