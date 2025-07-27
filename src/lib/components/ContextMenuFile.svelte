<script lang="ts">
    import { DirectoryFile } from '$scripts/ui/fs.svelte';

    
    import { copy, decryptFile, download, encryptFile, move, newFile, newFolder, paste, pasteBuffer, removeFile, rename } from '$scripts/ui/operations.svelte';
    import { selected } from './WindowFile.svelte';

    interface Props {
        exit: () => void
    }

    let { exit }: Props = $props();


    function exitWrapper(func: Function) {
            function wrapper(...args: any) {
                const ret = func(...args);
                exit();
                return ret;
            }
            return wrapper;
    }
</script>

<ul class="p-2 w-40 bg-green-500">

    {#if !selected.file}
        <li onclick={exitWrapper(newFile)} 
            class="hover:bg-green-400 select-none">New File</li>

        <li class="hover:bg-green-400 select-none"
        onclick={exitWrapper(newFolder)}
        >New Folder</li>
    {/if}

        

        {#if selected.file}
            <li
                onclick={exitWrapper(removeFile)}
                class="hover:bg-green-400 select-none">Remove
            </li>

             <li class="hover:bg-green-400 select-none"
                onclick={exitWrapper(rename)}>Rename
            </li>

            
             <li class="hover:bg-green-400 select-none"
                onclick={exitWrapper(copy)}>Copy
                </li>

            <li class="hover:bg-green-400 select-none"
            onclick={exitWrapper(move)}>Move
            </li>
            <!-- No upload since there's no APIs that allows selections of both
             directories and files in the same file picker -->
             
           <li
            onclick={exitWrapper(download)}
            class="hover:bg-green-400 select-none">Download
            </li>
        {/if}

        {#if pasteBuffer.file !== undefined}
            <li class="hover:bg-green-400 select-none"
                    onclick={exitWrapper(paste)}>Paste
            </li>
        {/if}

        {#if selected.file}
            <li class="hover:bg-green-400 select-none"
            onclick={exitWrapper(encryptFile)}>Encrypt
            </li>
        {/if}

        {#if selected.file && !DirectoryFile.isDirectory(selected.file) 
            && (selected.file.getExtension() === "enc"
            || selected.file.getExtension() === "encdir")}
            <li class="hover:bg-green-400 select-none"
            onclick={exitWrapper(decryptFile)}>Decrypt
            </li>
        {/if}
    </ul>