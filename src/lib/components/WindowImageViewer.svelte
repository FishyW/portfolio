

<script lang="ts">
    import { imageMimeMap } from "$scripts/ui/extension.svelte";
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

<WindowTopBar />

<div class="max-w-[50vw] max-h-[80vh] p-4 overflow-y-auto flex justify-center items-center">
    <!-- <canvas use:loadPDF></canvas> -->
        <img {@attach getImageData}  alt={file.name} />
      
</div>

