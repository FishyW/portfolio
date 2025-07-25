<script lang="ts">
    import { type RegFile } from "$scripts/fs.svelte";
    import WindowTopBar from "./WindowTopBar.svelte";

    export const ID = "PDFViewer";

    interface Props {
      file: RegFile
    }

    let { file }: Props = $props();

    // function loadPDF(node: HTMLElement) {
    //     async function load() {
    //       const PDFJS = await import("pdfjs-dist");
    //       console.log(PDFJS);
    //       // console.log(node);
    //       // const doc = await pdfjs.getDocument(file.contents).promise;
    //     }
    //     load();
    // } 


    async function loadPDF() {
        if (typeof(file.contents) === "string") {
            throw new Error("Invalid file content!");
        }
        return file.intoURL("application/pdf");
    }
  
 </script>

<WindowTopBar />

<div class="w-[50vw] h-[80vh] overflow-y-auto">
    <!-- <canvas use:loadPDF></canvas> -->
     {#await loadPDF()}{:then item} 
        <embed src={item} class="w-full h-full" type="application/pdf"/>
     {/await}
      
</div>

