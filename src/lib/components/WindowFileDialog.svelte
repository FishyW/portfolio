<script module lang="ts">
    import WindowFileDialogError from "./WindowFileDialogError.svelte";
    import WindowFileDialogPrompt from "./WindowFileDialogPrompt.svelte";

    enum DialogType {
        PROMPT, 
        ERROR,
        NONE
    };

    let type = $state(DialogType.NONE);

    let message = $state("");

    export function openErrorDialog(errorMessage: string) {
        message = errorMessage;
        type = DialogType.ERROR;
    }

    let onPrompt = (_value: boolean) => {};

    export function prompt(promptMessage: string): Promise<boolean> {
        return new Promise((res, rej) => {
            onPrompt = res;
            message = promptMessage;
            type = DialogType.PROMPT;
        })
    }

    function promptExit(result: boolean) {
        type = DialogType.NONE;
        onPrompt(result);
        onPrompt = (value: boolean) => {};
    }

</script>

<svelte:window 
    onkeydown={e => {
        if (type === DialogType.NONE) {
            return;
        }
        if (e.key === "Escape") {
            promptExit(false);
        }
    }}
/>

{#if type !== DialogType.NONE}
<div class="absolute flex justify-center items-center w-full h-full bg-black/30 z-50 pointer-events-auto">
    <div class="px-8 py-7 bg-window-bg shadow-[0_0_3px_3px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden">
        {#if type === DialogType.ERROR}
            <WindowFileDialogError onclose={() => {type = DialogType.NONE}} message={message}/>
        {:else if type === DialogType.PROMPT}
            <WindowFileDialogPrompt 
                onconfirm={() => promptExit(true)}
                oncancel={() => promptExit(false)}
                prompt={message}
                iconURL={""}
                />
        {/if}
    </div>
</div>
{/if}