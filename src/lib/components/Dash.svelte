<script>
    import DashElement from "./DashElement.svelte";
    import { FilesInfo  } from "$scripts/ui/windows";
    import { intoWindowsInfo, openWindows } from "./WindowManager.svelte";
    
    
    const pinnedApps = [
        FilesInfo
    ];
                

    const openWindowsInfo = $derived(
       intoWindowsInfo(openWindows)
    );


    
    const openWindowsInfoFiltered = $derived(
        openWindowsInfo.filter(info => 
            !pinnedApps.includes(info)
        )
    );



</script>
<div class="flex w-full justify-center absolute bottom-6 ">
    <div class="p-2 bg-secondary-80/40 gap-1 w-fit flex rounded-lg ">

        
        {#each openWindowsInfoFiltered as info}
            <DashElement {info} isOpened={true}/>
        {/each} 
        <!-- vertical rule -->
         {#if openWindowsInfoFiltered.length > 0}
        <div class="w-[1px] h-9/12 my-auto bg-secondary-90/30"></div>
        {/if}
        {#each pinnedApps as info}
            <DashElement {info} 
                isOpened={openWindows.includes(info.name)}
                />
        {/each} 
    </div>
</div>

