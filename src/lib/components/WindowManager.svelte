<!-- Maintains a map of active windows-->

<script module lang="ts">
       import Window from "./Window.svelte";
    import type WindowEmpty from "./dummy/WindowEmpty.svelte";
    import { SvelteMap } from "svelte/reactivity";    
    import type { WindowInfo } from "$scripts/ui/windows";

   
    interface WindowDetails {
        component: typeof WindowEmpty,
        propIndex: number,
        info: WindowInfo
    }

    const windowMap: Map<string, WindowDetails> = new SvelteMap();


    // specify the ordering of the windows
    export const openWindows: string[] = $state([]);

    // same with open windows except elements are not reordered
    export const openWindowFixed: string[] = $state([]);

    

    export function intoWindowsInfo(ids: string[]) {
        return ids.map(id => windowMap.get(id)!.info);
    }

    // we need a prop array since SvelteMaps are not deeply reactive
    const propArray: object[] = $state([]);
    

    export function open(
        info: WindowInfo,
        props = {}
    ) {
        
        const componentWindow = info.component as typeof WindowEmpty;
        const id = info.name;

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
            propIndex: propArray.length - 1,
            info
        });
        openWindows.push(id);
        openWindowFixed.push(id);
    }


    function close(id: string) {
        // remove id
        const idx = openWindows.indexOf(id);
        openWindows.splice(idx, 1);
        openWindowFixed.splice(idx, 1);
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
    {@const { component , propIndex } = windowMap.get(id)!}
    
    <div class="w-full flex-1 flex items-center">
    <div use:onclose={id} class="absolute left-1/2 top-1/2 -translate-1/2 pointer-events-none">
        <div class="h-fit pointer-events-none" style:translate="{random(-100, 100)}px {random(-100, 100)}px">
                <Window 
                {component}
                onmousedown={() => reorder(id)}
                props={propArray[propIndex]}
        />
        </div>
    </div>
    </div>
{/each}