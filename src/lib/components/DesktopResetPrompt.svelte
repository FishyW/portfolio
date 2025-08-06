<script>
    import warningIcon from "$icons/symbols/warning-outline-symbolic.svg";
    import { IndexedDBSystem } from "$scripts/virtual/indexdb";
    
    let { oncancel } = $props();

    async function reset() {
        // reset
        await IndexedDBSystem.reset();
        window.location.reload();
    }
</script>

<div class="fixed top-0 left-0 w-full h-full flex justify-center items-center">
    <div class="w-120 p-4 flex flex-col justify-center items-center bg-window-bg rounded-xl shadow-[0_0_5px_5px_rgba(0,0,0,0.2)]">
        <img src={warningIcon}  class="w-12 h-12 mb-3" alt="warning" />
        <p class="font-semibold text-xl text-center mb-1">Are you sure you want to reset all changes?</p> 
        <p class="font-normal text-sm mb-4">All changes will revert back to its original state.</p>
        <div class="flex w-full justify-evenly">
            <button 
            class="bg-secondary-60 text-white 
            hover:bg-secondary-50 rounded-xl px-6 py-2"
            onclick={oncancel}
            >Cancel</button>
            <button 
                class="bg-primary-60 text-white 
                hover:bg-primary-50 rounded-xl px-6 py-2"
                onclick={reset}
                >Confirm</button>
        </div>

    </div>
</div>
