<script lang="ts">
    import { setContext, type Component } from "svelte";
    

    interface Props {
        component: Component<any>,
        props: any,
        onclick: (arg: MouseEvent) => void
    };

    let { component, props, onclick }: Props = $props();
    const ComponentWindow = component;

    let ctx: {window: null | HTMLElement} 
        = $state({window: null});

    setContext("window", ctx);

</script>

<div {onclick} bind:this={ctx.window}   oncontextmenu={e => onclick(e)}
class="bg-white flex-col rounded-xl pointer-events-auto"
>
    <ComponentWindow 
        {...props} 
    />
</div>
