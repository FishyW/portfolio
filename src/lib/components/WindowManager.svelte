<!-- Maintains a map of active windows-->

<script module lang="ts">
   

    import type { Component } from "svelte";
    import Window from "./Window.svelte";
    import EmptyWindow from "./dummy/WindowEmpty.svelte";
    import { SvelteMap } from "svelte/reactivity";    

    // very hacky way of getting the component ID
    // each component "type" has its own ID
    // the internal component function is called manually to get an instance
    function getID(component: typeof EmptyWindow,
        props = {}): string {
        return component(document.createElement("div"), props).ID;
    }  

    // trigger is used to force update the element
    interface WindowDetails {
        component: typeof EmptyWindow,
        propIndex: number
    }

    const windowMap: Map<string, WindowDetails> = new SvelteMap();

    // we need a prop array since SvelteMaps are not deeply reactive
    const propArray: object[] = $state([]);

    export function open(
        component: Component<any>, 
        props = {}
    ) {
        
        const componentWindow = component as typeof EmptyWindow;
        const id = getID(componentWindow, props);

        const details = windowMap.get(id);

        // window is already opened, "destroy" and reopen the window
        if (details !== undefined) {
            propArray[details.propIndex] = props;
            reorder(id);
            return;
        }
        
        propArray.push(props);
        windowMap.set(id, {
            component: componentWindow, 
            propIndex: propArray.length - 1
        });
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
    {@const { component, propIndex } = windowMap.get(id)!}
   
    <div use:onclose={id} class="absolute left-1/2 top-1/2 -translate-1/2 pointer-events-none">
        <div class="h-fit pointer-events-none" style:translate="{random(-10, 10)}% {random(-10, 10)}%">
                <Window 
                {component}
                onclick={() => reorder(id)}
                props={propArray[propIndex]}
        />
        </div>
    </div>
{/each}