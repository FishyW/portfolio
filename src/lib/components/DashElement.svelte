<script>
    import { open } from './WindowManager.svelte';
    import FileWindow from './WindowFile.svelte';
</script>

<!-- Opens the File Window -->
<div 
tabindex="0"
role="button"
on:dblclick={_ => {open(FileWindow)}}
class="hover:bg-slate-800 w-16 h-16 bg-slate-900"
>

</div>