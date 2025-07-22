<!-- Maintains a map of active windows-->

<script module lang="ts">
   

    import type { Component } from "svelte";
    import Window from "./Window.svelte";
    import EmptyWindow from "./dummy/WindowEmpty.svelte";
    import { SvelteMap } from 'svelte/reactivity';

    let childprops = $state({});
    
    let selected = $state("");

    export function open(
        component: Component<any>, 
        setting: Setting,
        props?: object
    ) {
        if (props !== undefined) {
            childprops = props;
        }
        
        let windowInfo: [Component, Setting];
        
        if (!windows.has(setting.id)) {
            windows.set(setting.id, [component, setting]);
            windowInfo = [component, setting];
        } else {
            windowInfo = windows.get(setting.id) as [typeof EmptyWindow, Setting];
        }
        
        if (!openWindows.has(setting.id)) {
            openWindows.set(setting.id, windowInfo);
        }

        selected = setting.id;
    }

    export function close(id: string) {
        openWindows.delete(id);
    }

    export interface Setting {
        id: string,
        hasBack: boolean
    }

    const windows: Map<string, [Component, Setting]> = new Map();
    const openWindows: Map<string, [Component, Setting]> = new SvelteMap();

    function random(min: number, max: number) {
        return Math.random() * (max - min) + min; 
    }

    
</script>



{#each openWindows.entries() as [id, [InnerWindow, setting]]}
    <div class={["absolute left-1/2 top-1/2 -translate-1/2 pointer-events-none", 
        selected == id && "z-10"]}>
        <div class="h-fit pointer-events-none" style:translate="{random(-10, 10)}% {random(-10, 10)}%">
            <Window 
            component={InnerWindow} 
            onclick={() => selected = id}
            hasback={setting.hasBack}
            onclose={() => close(id)} 
            {childprops}
        />
        </div>
    </div>
{/each}