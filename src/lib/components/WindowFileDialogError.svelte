<script>
    import warningIcon from "$icons/symbols/warning-outline-symbolic.svg"

    let { onclose, message } = $props();
</script>

<div class="flex flex-col items-center justify-center  select-text pointer-events-auto">
    <img src={warningIcon} alt="warning icon" class="w-9 h-9 mb-3"/>
    <p class="text-lg font-semibold mb-6">{message}</p>
    <button 
        class="bg-primary-60 text-white 
        hover:bg-primary-50 rounded-xl px-6 py-2"
        onclick={onclose}
        >OK</button>
</div>