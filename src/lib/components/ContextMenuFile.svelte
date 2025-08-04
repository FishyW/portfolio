<script lang="ts">
    import { BaseFile, DirectoryFile } from '$scripts/ui/fs.svelte';

    
    import { copy, decryptFile, download, encryptFile, 
         move, newFile, newFolder, paste, pasteBuffer, 
         removeFile, rename, unmount } from '$scripts/ui/operations.svelte';
    import ContextMenuFileButton from './ContextMenuFileButton.svelte';

    import newFileIcon from "$icons/symbols/paper-symbolic.svg";
    import newFolderIcon from "$icons/symbols/folder-visiting-symbolic.svg";
    import removeIcon from "$icons/symbols/user-trash-symbolic.svg";
    import copyIcon from "$icons/symbols/copy-symbolic.svg";
    import encryptIcon from "$icons/symbols/lock-small-symbolic.svg";
    import decryptIcon from "$icons/symbols/lock-small-open-symbolic.svg";
    import downloadIcon from "$icons/symbols/arrow-pointing-at-line-down-symbolic.svg";
    import renameIcon from "$icons/symbols/edit-symbolic.svg";

    import mountIcon from "$icons/symbols/usb-stick-symbolic.svg";

    // move, paste, and unmount

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

<ul class="p-1 w-42 " bind:this={mainElement}>

    {#if !file}
        
        <ContextMenuFileButton onclick={exitWrapper(newFile)}>
            New File
        </ContextMenuFileButton>
      
        <ContextMenuFileButton onclick={exitWrapper(newFolder)}>
            New Folder
        </ContextMenuFileButton>
    {/if}

        

        {#if file}
            <ContextMenuFileButton onclick={exitWrapper(removeFile)}>
                Remove
            </ContextMenuFileButton>

            
            <ContextMenuFileButton onclick={exitWrapper(rename)}>
                Rename
            </ContextMenuFileButton>
        
            <ContextMenuFileButton onclick={exitWrapper(copy)}>
                Copy
            </ContextMenuFileButton>
        
            <ContextMenuFileButton onclick={exitWrapper(move)}>
                Move
            </ContextMenuFileButton>

            <!-- No upload since there's no APIs that allows selections of both
             directories and files in the same file picker -->

            <ContextMenuFileButton onclick={exitWrapper(download)}>
                Download
            </ContextMenuFileButton>
        {/if}
        {#if file && !isBaseMount}
            <ContextMenuFileButton onclick={exitWrapper(mountCallback!)}>
                Mount
            </ContextMenuFileButton>
        {/if}
        {#if file && isBaseMount}
            <ContextMenuFileButton onclick={exitWrapper(unmount)}>
                Unmount
            </ContextMenuFileButton>
        {/if}

        {#if pasteBuffer.file !== undefined}
            <ContextMenuFileButton onclick={exitWrapper(paste)}>
                Paste
            </ContextMenuFileButton>
        {/if}

        {#if file}
            <ContextMenuFileButton onclick={exitWrapper(encryptFile)}>
                Encrypt
            </ContextMenuFileButton>
        {/if}

        {#if file && !DirectoryFile.isDirectory(file) 
            && (file.getExtension() === "enc"
            || file.getExtension() === "encdir")}
            <ContextMenuFileButton onclick={exitWrapper(decryptFile)}>
                Decrypt
            </ContextMenuFileButton>
        {/if}
    </ul>

    <style>

    </style>