<!-- Maintains a map of active windows-->

<script module lang="ts">
   

    import type { Component } from "svelte";
    import Window from "./Window.svelte";
    import EmptyWindow from "./dummy/WindowEmpty.svelte";
    import { SvelteMap } from "svelte/reactivity";
    import WindowEmpty from "./dummy/WindowEmpty.svelte";

    let childprops = $state({});

    // very hacky way of getting the component ID
    // each component "type" has its own ID
    // the internal component function is called manually to get an instance
    function getID(component: typeof EmptyWindow,
        props = {}): string {
        return component(document.createElement("div"), props).ID;
    }  

    export function open(
        component: Component<any>, 
        props?: object
    ) {

        if (props !== undefined) {
            childprops = props;
        } else {
            childprops = {};
        }

        const componentWindow = component as typeof EmptyWindow;
        const id = getID(componentWindow, childprops);
        // do nothing if the window is already opened
        if (windowMap.has(id)) {
            reorder(id);
            return;
        }

        windowMap.set(id, componentWindow);
        openWindows.push(id);
    }

    function close(id: string) {
        // remove id
        const idx = openWindows.indexOf(id);
        openWindows.splice(idx, 1);
        windowMap.delete(id);
    }



    function random(min: number, max: number) {
        return Math.random() * (max - min) + min; 
    }

    function reorder(id: string) {
        const idx = openWindows.indexOf(id);
        if (idx === -1 || idx == openWindows.length - 1) {
            return;
        }
        openWindows.splice(idx, 1);
        openWindows.push(id);
    }
    
    // specify the ordering of the windows
    let openWindows: string[] = $state([]);


    // specify a map from id to window
    const windowMap: Map<string, typeof WindowEmpty> = new SvelteMap();

    function onclose(node: HTMLElement, id: string) {
        const handler = () => close(id);

        $effect(() => {
            node.addEventListener("close", handler);
            return () => {
                node.removeEventListener("close", handler);
            }
        })
    }

    export function dispatchClose(e: MouseEvent) {
         e.target!.dispatchEvent(
            new CustomEvent("close", {bubbles: true})
        );
    }
    
</script>


{#each openWindows as id (id) }
    <div use:onclose={id} class="absolute left-1/2 top-1/2 -translate-1/2 pointer-events-none">
        <div class="h-fit pointer-events-none" style:translate="{random(-10, 10)}% {random(-10, 10)}%">
            <Window 
            component={windowMap.get(id)!} 
            onclick={() => reorder(id)}
            {childprops}
        />
        </div>
    </div>
{/each}