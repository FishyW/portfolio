<script>
    import { getContext } from "svelte";

    let { value = $bindable() } = $props();

    const onselect = getContext("select");
</script>

<button onclick={() => onselect(value)}  class="hover:bg-gray-100 w-full bg-window-bg text-left p-1 text-sm  text-secondary-30 ">
{value}
</button>