<script>
    let { onclick, children, iconURL = null } = $props();
</script>

<li class="hover:bg-slate-200 text-secondary-10  text-sm p-1.5 px-4 rounded-md flex"
    {onclick}>  
    <div class="w-fit ">
    {@render children()} 
    </div>
    {#if iconURL !== null }
    <div class="h-5 flex  flex-1 items-center justify-end">
         <img class="w-3.5 h-3.5" src={iconURL} alt="Context Menu Icon" />
    </div>
    {/if}
</li>