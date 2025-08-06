<script lang="ts">
    import type { WindowInfo } from '$scripts/ui/info';
    import { tooltip } from '$scripts/ui/tippy.svelte';
    import { focusWindow, open } from './WindowManager.svelte';

    interface Props {
        info: WindowInfo,
        isOpened: boolean
    }
    
    let { info, isOpened = false }: Props = $props();

</script>

<!-- Opens the File Window -->
<div class="relative">
<button 
use:tooltip={info.name}
tabindex="-1"
onclick={_ => {
    if (isOpened) 
        focusWindow(info);
}}
ondblclick={_ => {!isOpened ? open(info) : focusWindow(info)}}
class="w-20 h-20 flex justify-center items-center
hover:bg-secondary-90/40 rounded-md p-2 m-1"
>
<img src={info.icon}  alt="Dash Element"/>


</button>

{#if isOpened}
<div class="absolute -bottom-2 w-full h-4 flex justify-center">
    <div class="w-1.5 h-1.5 bg-green-50 rounded-full"></div>
</div>
{/if}
</div>

<style>
    img {
        max-height: none;
        height: 60px;
        max-width: none;
    }
</style>