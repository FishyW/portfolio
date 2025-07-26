

<script lang="ts">
    import { imageMimeMap } from "$scripts/ui/extension.svelte";
    import { type RegFile } from "$scripts/fs.svelte";
    import WindowTopBar from "./WindowTopBar.svelte";


    interface Props {
      file: RegFile
    }

    let { file }: Props = $props();

    async function getImageData() {
        const extension = file.getExtension()!;
        const mime = imageMimeMap[extension];
        return file.intoURL(mime);
    }

 </script>

<WindowTopBar />

<div class="max-w-[50vw] max-h-[80vh] p-4 overflow-y-auto flex justify-center items-center">
    <!-- <canvas use:loadPDF></canvas> -->
     {#await getImageData() then data} 
        <img src={data}  alt={file.name} />
     {/await}
      
</div>

