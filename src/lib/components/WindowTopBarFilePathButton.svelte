<script>
    import { DirectoryFile, fileSystem } from "$scripts/ui/fs.svelte";
    import { changeDirectory } from "$scripts/ui/operations.svelte";

    let { segment, fullpath } = $props();

    import homeImg from "$icons/symbols/home.svg";
    import disabledHomeImg from "$icons/symbols/disabled/home.svg";
    
    let isHovered = $state(false);

    function segmentSelect() {
        const directory = fileSystem.findFile(fullpath);
        if (directory === null || !DirectoryFile.isDirectory(directory)) {
            throw new Error("Directory not found!")
        }
        if (fullpath === fileSystem.cwd.path) {
            return;
        }
        
        changeDirectory(directory);
    }   
</script>

<button onclick={() => segmentSelect()} 
    onmouseenter={() => isHovered = true}
    onmouseleave={() => isHovered = false}
    class={["rounded-md font-bold  px-2 py-1",
    fullpath === fileSystem.cwd.path && "text-secondary-30",
    fullpath !== fileSystem.cwd.path && "hover:bg-gray-300 text-secondary-70 hover:text-secondary-30"
]}>

{#if fullpath === "/home"}
<div class="flex items-center">
    <img src={fullpath === fileSystem.cwd.path || isHovered ? homeImg : disabledHomeImg} alt="home" class="w-[1rem] h-[1rem] mr-1"/>Home
</div>
{:else}
    {segment}
{/if}

</button>