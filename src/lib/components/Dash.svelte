<script>
    import DashElement from "./DashElement.svelte";
    import { FilesInfo  } from "$scripts/ui/windows";
    import { intoWindowsInfo, openWindowFixed } from "./WindowManager.svelte";
    
    
    const pinnedApps = [
        FilesInfo
    ];
                

    const openWindowsInfo = $derived(
       intoWindowsInfo(openWindowFixed)
    );
    
    const openWindowsInfoFiltered = $derived(
        openWindowsInfo.filter(info => 
            pinnedApps.indexOf(info) === -1
        )
    );


</script>

<div class="p-2 rounded-lg bg-white w-fit flex">
    {#each openWindowsInfoFiltered as info}
        <DashElement {info} isOpened={true}/>
    {/each} 
    {#each pinnedApps as info}
        <DashElement {info} 
            isOpened={openWindowFixed.indexOf(info.name) !== -1}
            />
    {/each} 
</div>


