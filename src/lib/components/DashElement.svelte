<script lang="ts">
    import type { WindowInfo } from '$scripts/ui/windows';
    import { focusWindow, open } from './WindowManager.svelte';

    interface Props {
        info: WindowInfo,
        isOpened: boolean
    }
    
    let { info, isOpened = false }: Props = $props();

</script>

<!-- Opens the File Window -->
<div 
tabindex="-1"
role="button"
onclick={_ => {
    if (isOpened) 
        focusWindow(info);
}}
ondblclick={_ => {!isOpened ? open(info) : focusWindow(info)}}
class="w-20 h-20 flex justify-center items-center hover:bg-secondary-90/40 rounded-md p-2 m-1"
>
<img src={info.icon}  alt="Dash Element"/>
</div>

<style>
    img {
        max-height: none;
        height: 60px;
        max-width: none;
    }
</style>