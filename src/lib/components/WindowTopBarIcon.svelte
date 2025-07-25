<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        onclick?: (e: MouseEvent) => void,
        children?: Snippet,
        disabled?: boolean
    };
    let props: Props = $props();
    let { onclick, children, disabled = false } = props;

</script>

<div class={["w-4 h-4 text-xs justify-center items-center whitespace-nowrap flex", !disabled && "bg-white hover:bg-gray-700", 
    disabled && "bg-slate-300"]} { onclick }>
    {@render children?.() }
</div>  