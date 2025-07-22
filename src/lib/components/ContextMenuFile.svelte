<script lang="ts" module>

    import { renamePrompt } from './WindowFileElement.svelte';
    import { fileSystem } from "$scripts/fs.svelte";



    type Operation = "MOVE" | "COPY";

    type PasteBuffer = { file?: BaseFile, operation?:  Operation };

    export let pasteBuffer: PasteBuffer = $state({});
    
    
</script>


<script lang="ts">
    import { BaseFile, DirectoryFile } from '$scripts/fs.svelte';

    interface Props {
        exit: () => void,
        selectedFile?: BaseFile,
        renameCallback?: () => void
    }

    let { exit, selectedFile, renameCallback }: Props = $props();

    $inspect(selectedFile);
</script>

<ul class="w-48 h-48 bg-green-500">
        <li class="hover:bg-green-400 select-none" 
        onclick={() => {
            const file = fileSystem.addEmptyFile();
            renamePrompt(file.name);
            exit();
        }}>New File</li>

        <li class="hover:bg-green-400 select-none"
        onclick={() => {
            const folder = fileSystem.addEmptyFolder();
            renamePrompt(folder.name);
            exit();
        }}
        >New Folder</li>

       

        {#if selectedFile }
            <li
                onclick={() => {
                fileSystem.removeFile(selectedFile!);
                exit();
            }}
                class="hover:bg-green-400 select-none">Remove
            </li>

             <li class="hover:bg-green-400 select-none"
                onclick={() => {
                    renameCallback!();
                    exit();
                }}>Rename
                </li>

            
             <li class="hover:bg-green-400 select-none"
                onclick={() => {
                  
                    // prevent reassignment
                    pasteBuffer.file = selectedFile!;
                    pasteBuffer.operation = "COPY";
                    exit();
                }}>Copy
                </li>

                <li class="hover:bg-green-400 select-none"
                onclick={() => {
                  
                    // prevent reassignment
                    pasteBuffer.file = selectedFile!;
                    pasteBuffer.operation = "MOVE";
                    exit();

                }}>Move
                </li>
             
        {/if}

        {#if pasteBuffer.file !== undefined}
            <li class="hover:bg-green-400 select-none"
                    onclick={() => {
                        const targetDir = (selectedFile && DirectoryFile.isDirectory(selectedFile)) 
                            ? selectedFile : fileSystem.cwd;
                        
                        if (targetDir.path === pasteBuffer.file!.parent?.path 
                            && pasteBuffer.operation === "MOVE") {
                            pasteBuffer.file = undefined;
                            exit();
                            return;
                        }
                        

                        if (pasteBuffer.operation === "COPY") {
                            fileSystem.copy(pasteBuffer.file!, targetDir);
                        } else if (pasteBuffer.operation === "MOVE") {
                            fileSystem.move(pasteBuffer.file!, targetDir);
                        }
                        
                        pasteBuffer.file = undefined;
                        exit();
                    }}>Paste
            </li>
        {/if}
    </ul>