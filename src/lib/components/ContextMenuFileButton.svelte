<script>
    let { onclick, children, iconURL = null } = $props();
</script>

<li class="hover:bg-primary-80 p-0.5 px-3 rounded-md"
    {onclick}>  
    {@render children()} 
    {#if iconURL !== null }
    <img src={iconURL} alt="Context Menu Icon" />
    {/if}
</li>