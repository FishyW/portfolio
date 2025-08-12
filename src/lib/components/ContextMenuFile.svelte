<script lang="ts">
    import { BaseFile, DirectoryFile } from '$scripts/ui/fs.svelte';

    
    import { copy, decryptFile, download, encryptFile, 
         move, newFile, newFolder, paste, pasteBuffer, 
         removeFile, rename, mount, unmount } from '$scripts/ui/operations.svelte';
    import ContextMenuFileButton from './ContextMenuFileButton.svelte';

    import newFileIcon from "$icons/symbols/paper-symbolic.svg";
    import newFolderIcon from "$icons/symbols/folder-visiting-symbolic.svg";
    import removeIcon from "$icons/symbols/user-trash-symbolic.svg";
    import copyIcon from "$icons/symbols/copy-symbolic.svg";
    import encryptIcon from "$icons/symbols/padlock2-symbolic.svg";
    import downloadIcon from "$icons/symbols/arrow-pointing-at-line-down-symbolic.svg";
    import renameIcon from "$icons/symbols/edit-symbolic.svg";
    import pasteIcon from "$icons/symbols/clipboard-symbolic.svg";
    import moveIcon from "$icons/symbols/move-tool-symbolic.svg";

    import mountIcon from "$icons/symbols/usb-stick-symbolic.svg";
    import unmountIcon from "$icons/symbols/eject-symbolic.svg";

    // move, paste, and unmount

    interface Props {
        file?: BaseFile
    }

    let { file }: Props = $props();

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
        
        <ContextMenuFileButton 
            iconURL={newFileIcon}
            onclick={exitWrapper(newFile)}>
            New File
        </ContextMenuFileButton>
      
        <ContextMenuFileButton 
            iconURL={newFolderIcon}
            onclick={exitWrapper(newFolder)}>
            New Folder
        </ContextMenuFileButton>
    {/if}

        

        {#if file}

            
            <ContextMenuFileButton 
                iconURL={renameIcon}
                onclick={exitWrapper(rename)}>
                Rename
            </ContextMenuFileButton>
        
            <ContextMenuFileButton 
                iconURL={copyIcon}
                onclick={exitWrapper(copy)}>
                Copy
            </ContextMenuFileButton>
        
            <ContextMenuFileButton 
                iconURL={moveIcon}
                onclick={exitWrapper(move)}>
                Move
            </ContextMenuFileButton>
        {/if}

        {#if pasteBuffer.file !== undefined}
            <ContextMenuFileButton 
                iconURL={pasteIcon}
                onclick={exitWrapper(paste)}>
                Paste
            </ContextMenuFileButton>
        {/if}

         {#if file}
            <ContextMenuFileButton 
                iconURL={removeIcon}
                onclick={exitWrapper(removeFile)}>
                Remove
            </ContextMenuFileButton>

            <!-- No upload since there's no APIs that allows selections of both
             directories and files in the same file picker -->

            <ContextMenuFileButton 
                iconURL={downloadIcon}
                onclick={exitWrapper(download)}>
                Download
            </ContextMenuFileButton>
        {/if}
        {#if file && !isBaseMount}
            <ContextMenuFileButton 
                iconURL={mountIcon}
                onclick={exitWrapper(mount)}>
                Mount
            </ContextMenuFileButton>
        {/if}
        {#if file && isBaseMount}
            <ContextMenuFileButton 
                iconURL={unmountIcon}
                onclick={exitWrapper(unmount)}>
                Unmount
            </ContextMenuFileButton>
        {/if}

        

        {#if file}
            <ContextMenuFileButton 
                iconURL={encryptIcon}
                onclick={exitWrapper(encryptFile)}>
                Encrypt
            </ContextMenuFileButton>
        {/if}

    </ul>

    <style>

    </style>