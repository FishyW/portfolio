<script lang="ts">
    import { setContext, type Component } from "svelte";
    

    interface Props {
        component: Component<any>,
        childprops: any,
        onclick: (arg: MouseEvent) => void
    };

    let { component, childprops, onclick }: Props = $props();
    const ComponentWindow = component;

    let ctx: {window: null | HTMLElement} 
        = $state({window: null});

    setContext("window", ctx);
</script>

<div {onclick} bind:this={ctx.window} oncontextmenu={e => onclick(e)}
class="bg-gray-600 flex-col pointer-events-auto"
>
    <ComponentWindow 
        {...childprops} 
    />
</div>
