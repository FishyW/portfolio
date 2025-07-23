<script>
    import { open } from './WindowManager.svelte';
    import FileWindow from './WindowFile.svelte';
</script>

<!-- Opens the File Window -->
<div 
tabindex="0"
role="button"
on:dblclick={_ => {open(FileWindow)}}
class="hover:bg-gray-100 p-1 select-none"
>
Oks 
</div>