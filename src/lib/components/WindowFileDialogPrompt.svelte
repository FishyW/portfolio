<script lang="ts">
    interface Props {
        oncancel: () => void,
        onconfirm: (val: string) => void,
        iconURL: string,
        message: string, 
    }
    let { oncancel, onconfirm, iconURL, message }: Props = $props();

    let value = $state("");

</script>

<svelte:window 
    onkeydown={e => {
        if (e.key === "Escape") {
            oncancel();
        }
        if (e.key === "Enter") {
            onconfirm(value);
        }
    }}
/>

<div class="w-72 flex flex-col items-center justify-center  select-text pointer-events-auto">
    <img src={iconURL} alt="icon" class="w-10 h-10 mb-3"/>
    <p class="text-lg font-semibold mb-4">{message}</p>
    <input bind:value type="password" placeholder="Password" class="w-full mb-4 p-2 px-2 text-sm outline-primary-60 bg-gray-200 rounded-md" />
    <div class="flex w-full justify-between">
        <button 
        class="bg-secondary-60 text-white 
        hover:bg-secondary-50 rounded-xl px-6 py-2"
        onclick={oncancel}
        >Cancel</button>
        <button 
            class="bg-primary-60 text-white 
            hover:bg-primary-50 rounded-xl px-6 py-2"
            onclick={() => {
                onconfirm(value);
            }}
            >Confirm</button>
    </div>
    
</div>