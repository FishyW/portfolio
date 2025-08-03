<script lang="ts">
    import { setContext, type Component } from "svelte";
    import WindowResizable from "./WindowResizable.svelte";
    import type { BaseFile } from "$scripts/fs";
    

    interface Props {
        component: Component<any>,
        props: any,
        onmousedown: (arg: MouseEvent) => void
    };

    let { component, props, onmousedown }: Props = $props();
    const ComponentWindow = component;

    let ctx: {window: null | HTMLElement} 
        = $state({window: null});

    setContext("window", ctx);


    let onresizestart = $state(() => {});
    let onresizeend = $state(() => {});

    let file: BaseFile | undefined = props.file;

</script>

<div bind:this={ctx.window} {onmousedown}
class="pointer-events-auto relative"
>
    <WindowResizable {onresizeend} {onresizestart} minWidth={630} minHeight={600}>
             
        <div class="bg-window-bg h-full
        flex-col rounded-xl overflow-hidden shadow-[0_0_5px_5px_rgba(0,0,0,0.2)] ">
            <ComponentWindow 
                bind:onresizeend
                bind:onresizestart
                {...props} 
            />
        </div>
    </WindowResizable>
    
</div>
