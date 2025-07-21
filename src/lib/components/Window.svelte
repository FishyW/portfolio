<script lang="ts">
    import type { Component } from "svelte";
    import WindowFile from "./WindowFile.svelte";

    interface Props {
        component: Component,
        onclose: (arg: MouseEvent) => void,
        hasback: boolean,
        childprops: any,
        onclick: (arg: MouseEvent) => void
    };

    let { component , onclose, childprops, onclick, hasback }: Props = $props();
    let ComponentWindow = component;


    // svelte-ignore non_reactive_update 
    let parentWindow: HTMLElement;
    // svelte-ignore non_reactive_update 
    let childWindow: ReturnType<Component>;
    let isDragging = true;
    let offset = {x: 0, y: 0};
    let currentTranslate = {x: 0, y: 0};
    // no need to make this reactive
    let mInit = { x: 0, y: 0 };
    let mNow = { x: 0, y: 0 };

    const DELTA = 5;

    let handler: number;

    let backHandler: (arg: MouseEvent) => void;
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
            parentWindow.style.translate = `${offset.x}px ${offset.y}px`;
            handler = requestAnimationFrame(drag);
        } else {
            currentTranslate.x = offset.x;
            currentTranslate.y = offset.y;
            cancelAnimationFrame(handler);
        }

    }
</script>




<div bind:this={parentWindow} {onclick} oncontextmenu={e => onclick(e)}
class="bg-gray-600 flex-col pointer-events-auto"
>
   <!-- Top bar -->
 <div draggable=true ondrag = {e => {
        mNow.x = e.clientX;
        mNow.y = e.clientY;
    }} 

    ondragstart={e => {
        // propagate onclick
        onclick(e);
        mNow.x = e.clientX;
        mNow.y = e.clientY;

        mInit = structuredClone(mNow);
        requestAnimationFrame(drag);
        isDragging = true;
        const offsetX = mNow.x - mInit.x;
        const offsetY = mNow.y - mInit.y;

        e.dataTransfer!.setDragImage(document.createElement("div"), 0, 0);

    }} 
    ondragend={e => {
        isDragging = false;
          
    }} class="w-full h-8 bg-black flex">

    {#if hasback}
        <div class="w-4 h-4 bg-white hover:bg-gray-700" 
        onclick={e => (childWindow as ReturnType<typeof WindowFile>).backHandler(e)}></div>
    {/if}
        <div class="flex-1"></div>
        <div class="w-4 h-4 bg-white hover:bg-gray-700" 
            onclick={onclose}
        ></div>    
    
    
    </div>
    
   
    <ComponentWindow bind:this={childWindow} {...childprops} />
</div>
