<!-- Empty Window -->

<script module>
    import type { RegFile } from "$scripts/fs.svelte";
    import type { Setting } from "./WindowManager.svelte";
  
    export const setting: Setting = {
        id: "TextEditor",
        hasBack: false
    };


</script>


 <script lang="ts">

    interface Props {
      file: RegFile
    }

    let { file }: Props = $props();
    let value = $state();

 </script>

 <div class="w-[50vw] h-[80vh]">
  <textarea class="w-full h-full outline-none p-4" bind:value onkeyup={_ => {
    file.save(value as string);
  }}>{file.contents}</textarea>
 </div>