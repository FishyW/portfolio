<script>
    import Dash from "./Dash.svelte"
    import FileContextMenu from "./WindowFileContextMenu.svelte";
    import TopBar from "./TopBar.svelte"
    import WindowManager from "./WindowManager.svelte";
</script>

<div class="h-full w-full bg-[url(/bg.png)] bg-cover flex flex-col relative">
    <!-- Position utility "breaks" out of the page flow -->
        <TopBar />
        <div class="w-full flex-1 flex items-center">
            <WindowManager />
        </div>
        <div class="flex w-full justify-center">
            <Dash />
        </div>

</div>

<!-- can't place the context menu as a child of the file menu -->
<!-- position fixed apparently gets "reset" under transform -->
<FileContextMenu />

