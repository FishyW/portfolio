<script lang="ts">
    import { BaseFile, DirectoryFile } from '$scripts/ui/fs.svelte';

    
    import { copy, decryptFile, download, encryptFile, 
         move, newFile, newFolder, paste, pasteBuffer, 
         removeFile, rename, unmount } from '$scripts/ui/operations.svelte';

    interface Props {
        file?: BaseFile,
        mountCallback?: () => void
    }

    let { file, mountCallback }: Props = $props();

    let exit: () => void;
    let mainElement: HTMLElement;

    export function setExit(exitFunc: () => void) {
        exit = exitFunc;
    }

    export function getChild() {
        return mainElement;
    }

    
    let isBaseMount = $state(file?.isBaseMount);

    export function update() {
        isBaseMount = file?.isBaseMount;
    }

    function exitWrapper(func: Function) {
            function wrapper(...args: any) {
                const ret = func(...args);
                exit();
                return ret;
            }
            return wrapper;
    }


</script>

<ul class="p-2 w-40 bg-green-500" bind:this={mainElement}>

    {#if !file}
        <li onclick={exitWrapper(newFile)} 
            class="hover:bg-green-400 select-none">New File</li>

        <li class="hover:bg-green-400 select-none"
        onclick={exitWrapper(newFolder)}
        >New Folder</li>
    {/if}

        

        {#if file}
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

        {#if file && !isBaseMount}
            <li class="hover:bg-green-400 select-none"
                onclick={exitWrapper(mountCallback!)}>Mount
            </li>
        {/if}
        {#if file && isBaseMount}
            <li class="hover:bg-green-400 select-none"
                onclick={exitWrapper(unmount)}>Unmount
            </li>
        {/if}
        {/if}

        {#if pasteBuffer.file !== undefined}
            <li class="hover:bg-green-400 select-none"
                    onclick={exitWrapper(paste)}>Paste
            </li>
        {/if}

        {#if file}
            <li class="hover:bg-green-400 select-none"
            onclick={exitWrapper(encryptFile)}>Encrypt
            </li>
        {/if}

        {#if file && !DirectoryFile.isDirectory(file) 
            && (file.getExtension() === "enc"
            || file.getExtension() === "encdir")}
            <li class="hover:bg-green-400 select-none"
            onclick={exitWrapper(decryptFile)}>Decrypt
            </li>
        {/if}
    </ul>