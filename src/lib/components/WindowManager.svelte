<!-- Maintains a map of active windows-->

<script module lang="ts">
       import Window from "./Window.svelte";
    import type WindowEmpty from "./dummy/WindowEmpty.svelte";
    import { SvelteMap } from "svelte/reactivity";    
    import type { WindowInfo } from "$scripts/ui/info";
    import { browser } from "$app/environment";

   
    interface WindowDetails {
        component: typeof WindowEmpty,
        propIndex: number,
        info: WindowInfo
    }

    const windowMap: Map<string, WindowDetails> = new SvelteMap();



    export const openWindows: string[] = $state([]);
    export const zArray: string[] = [];
    

    export function intoWindowsInfo(ids: string[]) {
        return ids.map(id => windowMap.get(id)!.info);
    }

    // we need a prop array since SvelteMaps are not deeply reactive
    const propArray: object[] = $state([]);

    let components: HTMLElement[] = $state([])
    
    export function focusWindow(info: WindowInfo) {
        const id = info.name;
        reorder(id);
    }

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
        zArray.push(id);
    }


    function close(id: string) {
        // remove id
        const idx = openWindows.indexOf(id);
        openWindows.splice(idx, 1);
        components.splice(idx, 1);

        const zIdx = zArray.indexOf(id);
        zArray.splice(zIdx, 1);

        windowMap.delete(id);
    }



    function random(min: number, max: number) {
        return Math.random() * (max - min) + min; 
    }

    function setReorder() {
        // set the z-indices
        for (const [i, zId] of zArray.entries()) {
            let component = components[openWindows.indexOf(zId)];
            if (component !== undefined)
                component.style.zIndex = `${i + 10}`;
        }
    }

    function reorder(id: string) {
        const idx = zArray.indexOf(id);
        if (idx === -1 || idx == openWindows.length - 1) {
            return;
        }
        zArray.splice(idx, 1);
        zArray.push(id);

        setReorder();

        // needed for to trigger the PDF overlay
        window.dispatchEvent(new CustomEvent("reorder", {detail: id}));
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
    
    const BREAKPOINT_DESKTOP = 630;

    let translationX = $state(100);
    let translationY = $state(100);

    if (browser) {
        translationX = window.innerWidth >= BREAKPOINT_DESKTOP ? 100 : 10/100 * window.innerWidth;
        translationY = window.innerWidth >= BREAKPOINT_DESKTOP ? 100 : 10/100 * window.innerHeight;
    }

   

</script>




{#each openWindows as id, i (id) }
    {@const { component , propIndex } = windowMap.get(id)!}
    
    <div {@attach (_) => setReorder()} bind:this={components[i]} class="w-full flex-1 flex items-center pointer-events-none">
    <div use:onclose={id} class="absolute left-1/2 top-1/2 -translate-1/2 pointer-events-none">
        <div class="h-fit pointer-events-none" style:translate="{random(-translationX, translationX)}px {random(-translationY, translationY)}px">
            <Window 
                {component}
                onmousedown={e => {
                    reorder(id)
                }}
                props={propArray[propIndex]}
        />
        </div>
    </div>
    </div>
{/each}