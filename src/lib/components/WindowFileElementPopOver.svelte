<script lang="ts">
    import type { BaseFile } from "$scripts/fs";
    import { VFSMap } from "$scripts/ui/config.svelte";
    import WindowFileSelect from "./WindowFileSelect.svelte";
    import WindowFileSelectOption from "./WindowFileSelectOption.svelte";

    interface Props {
        callback: (editedName: string) => void,
        mode: 'rename' | 'mount' | 'none',
        tippyOn: boolean,
        file: BaseFile
    }

    let nameValid = $state(true);

    let mountMode = $state(Object.keys(VFSMap)[0]);

    function onconfirm() {
        let finalInput = editedInput;
        if (mode === "mount") {
            finalInput = mountMode! + "://" + editedInput;
        }
        if (nameValid) {
            callback(finalInput);
        }
    }


    let editedInput = $state("");
    // let mountPath = $state("file://");
    
    let inputBox: HTMLInputElement;

    let {  callback, file,
            mode, tippyOn } : Props = $props();


    function computeWidth(name: string) {
        const elem = document.createElement("div");
        elem.innerText = name;
        elem.style.visibility = "hidden";
        elem.style.position = "fixed";
        elem.style.padding = "4px";
        document.body.appendChild(elem);
        const width =  elem.getBoundingClientRect().width;
        elem.remove();
        return width;
    }

    
    function inputMount(node: HTMLInputElement) {
        $effect(() => {
            tippyOn;         
            node.focus();
            
            nameValid = true;
            
            if (mode === "mount") {
                editedInput = "";
                node.style.width = "20px";
                return;
            }

            if (mode !== "rename") {
                return;
            }

            
            editedInput = file.name;
            node.value = file.name;
            node.setSelectionRange(0, file.name.lastIndexOf("."));
            
            node.style.width = `${computeWidth(file.name)}px`;
        })
}


</script>


<div 
class="mt-0.5 flex items-center"
>

{#if mode === "mount"}
<WindowFileSelect bind:value={mountMode}>
    {#each Object.keys(VFSMap) as item}
      <WindowFileSelectOption value={item}/>
    {/each}
</WindowFileSelect>
<div class="mx-1 text-secondary-40 font-semibold">
://
</div>
{/if}
<input 
bind:this={inputBox}

class="min-w-28 p-1 text-sm/tight line rounded-sm bg-gray-200 outline-primary-70"
onkeydown={e => {
    if (e.key === 'Enter' ) {
        onconfirm();
    }
}}

onkeyup={e => {
    nameValid = mode === "rename" ? file.isValidName(editedInput) : true;
}}
    use:inputMount type="text" bind:value={editedInput} />
<button onclick={() => {onconfirm()}} 
    class={["ml-2 p-1 px-2 text-white rounded-md", 
       nameValid && "bg-primary-60 hover:bg-primary-50",
       !nameValid && "bg-primary-70"]}>
   {#if mode === 'rename'}
        Rename
   {:else if mode === 'mount'}
        Mount
    {/if}
</button>
</div>


