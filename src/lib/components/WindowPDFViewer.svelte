<script lang="ts">
    import { type RegFile } from "$scripts/fs.svelte";
    import { DocumentViewerInfo } from "$scripts/ui/windows";
    import { openWindows } from "./WindowManager.svelte";
    import WindowTopBar from "./WindowTopBar.svelte";


    interface Props {
      file: RegFile
    }

    let { file }: Props = $props();
    let hideOverlay = $state(true);

    // function loadPDF(node: HTMLElement) {
    //     async function load() {
    //       const PDFJS = await import("pdfjs-dist");
    //       console.log(PDFJS);
    //       // console.log(node);
    //       // const doc = await pdfjs.getDocument(file.contents).promise;
    //     }
    //     load();
    // } 


    function loadPDF(node: HTMLEmbedElement) {
        if (typeof(file.contents) === "string") {
            throw new Error("Invalid file content!");
        }
        const url  = URL.createObjectURL(file.intoFile("application/pdf"));
        node.src = url;
        return () => {
            URL.revokeObjectURL(url);
        }

    }
  
    $effect(() => {
        hideOverlay = openWindows.at(-1) 
            === DocumentViewerInfo.name;
    })

 </script>

<WindowTopBar 
    ondragstart={() => hideOverlay = false}
    ondragend={() => hideOverlay = true} 
/>

<div class="w-[50vw] h-[80vh] overflow-y-auto relative">
    <!-- <canvas use:loadPDF></canvas> -->
     
    <embed {@attach loadPDF} class="w-full h-full" type="application/pdf"/>
     {#if !hideOverlay}
      <div class="absolute w-full h-full top-0"></div>
    {/if}
</div>
