<script lang="ts">

    interface Props {
        filename: string,
        renameCallback: (editedName: string) => void,
        mountCallback: (path: string) => void,
        mode: 'rename' | 'mount' | 'none',
        tippyOn: boolean,
    }


    let editedName = $state("");
    let mountPath = $state("file://");

    let { filename, renameCallback, mountCallback,
            mode, tippyOn } : Props = $props();

       function inputMount(node: HTMLInputElement) {
        $effect(() => {
            tippyOn;
            editedName = filename;
            node.focus();
            node.value = filename;
            node.setSelectionRange(0, filename.lastIndexOf("."));
        })
    }

    
</script>

{#if mode === "rename"}
<input 
class="w-20"
onkeydown={e => {
    if (e.key === 'Enter') {
        renameCallback(editedName)
    }
    
}}
    use:inputMount type="text" bind:value={editedName} />
{:else if mode === "mount"}

<input 
class="w-20"
onkeydown={e => {
    if (e.key === 'Enter') {
        mountCallback(mountPath)
    }
}}
    type="text" use:inputMount bind:value={mountPath} />

{/if}

