<!-- Empty Window -->


 <script lang="ts">
    import type { RegFile } from "$scripts/fs.svelte";
    import WindowTopBarDefault from "./WindowTopBarDefault.svelte";
    export const ID = "TextEditor";

    interface Props {
      file: RegFile
    }

    let { file }: Props = $props();
    let value = $state();

 </script>

<WindowTopBarDefault />


  <div class="w-[50vw] h-[80vh]">
    {#if typeof(file.contents) === "string"}
      <textarea class="w-full h-full outline-none p-4" bind:value onkeyup={_ => {
        file.save(value as string);
      }}>{ file.contents }</textarea>
    {:else}
        <textarea readonly 
        class="w-full h-full outline-none p-4"
        >{ new TextDecoder().decode(file.contents) }</textarea>
    {/if}

 </div>


