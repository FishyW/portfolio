<script lang="ts">
    import type { WindowInfo } from '$scripts/ui/windows';
    import { open } from './WindowManager.svelte';

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
        open(info);
}}
ondblclick={_ => {open(info)}}
class="hover:bg-slate-800 w-16 h-16 bg-slate-900 m-1"
>

</div>