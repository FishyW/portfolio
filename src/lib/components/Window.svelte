<script lang="ts">
    import { setContext, type Component } from "svelte";
    import WindowResizable from "./WindowResizable.svelte";
    import { browser } from "$app/environment";
    

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


    const BREAKPOINT_DESKTOP = 630;
    const PADDING = 50;

    let minWidth = $state(BREAKPOINT_DESKTOP);

    if (browser) {
        minWidth = window.innerWidth > BREAKPOINT_DESKTOP - PADDING ? BREAKPOINT_DESKTOP 
        : window.innerWidth - PADDING;
    }
    

</script>

<div bind:this={ctx.window} {onmousedown}
class="pointer-events-auto relative"
>
    <WindowResizable {onresizeend} {onresizestart} {minWidth} minHeight={600}>
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
