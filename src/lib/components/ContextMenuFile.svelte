<script lang="ts">
    
    import { copy, move, newFile, newFolder, paste, pasteBuffer, removeFile, rename } from '$scripts/operations.svelte';
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

<ul class="w-48 h-48 bg-green-500">
        <li onclick={exitWrapper(newFile)} class="hover:bg-green-400 select-none">New File</li>

        <li class="hover:bg-green-400 select-none"
        onclick={exitWrapper(newFolder)}
        >New Folder</li>

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
        {/if}

        {#if pasteBuffer.file !== undefined}
            <li class="hover:bg-green-400 select-none"
                    onclick={exitWrapper(paste)}>Paste
            </li>
        {/if}
    </ul>