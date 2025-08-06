

<script lang="ts">
    import { imageMimeMap } from "$scripts/ui/config.svelte";
    import { type RegFile } from "$scripts/fs";
    import WindowTopBar from "./WindowTopBar.svelte";


    interface Props {
      file: RegFile
    }

    let { file }: Props = $props();

    function getImageData(node: HTMLImageElement) {
        const extension = file.getExtension()!;
        const mime = imageMimeMap[extension];
        const url  = URL.createObjectURL(file.intoFile(mime));
        node.src = url;
        return () => {
            URL.revokeObjectURL(url);
        }
    }

 </script>

<div class="flex flex-col h-full">
<WindowTopBar content={file.name} />

<div class="p-16 overflow-y-auto flex justify-center  h-full items-center">
    <!-- <canvas use:loadPDF></canvas> -->
        <img class="w-full h-full" {@attach getImageData}  alt={file.name} />
      
</div>
</div>


