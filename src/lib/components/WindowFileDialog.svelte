<script module lang="ts">
    import type { PromptInfo } from "$scripts/ui/info";
    import WindowFileDialogError from "./WindowFileDialogError.svelte";
    import WindowFileDialogPrompt from "./WindowFileDialogPrompt.svelte";


    enum DialogType {
        PROMPT, 
        ERROR,
        NONE
    };

   
    let promptInfo: PromptInfo = $state({message: "", iconURL: ""});

    let type = $state(DialogType.NONE);

    let message = $state("");


    export function openErrorDialog(errorMessage: string) {
        message = errorMessage;
        type = DialogType.ERROR;
    }

    let onPrompt = (_value: string | null) => {};

    export function prompt(info: PromptInfo): Promise<string | null> {
        return new Promise((res, rej) => {
            onPrompt = res;
            promptInfo = info;
            type = DialogType.PROMPT;
        })
    }

    function promptExit(result: string | null) {
        if (type != DialogType.PROMPT) {
            return;
        } 
        type = DialogType.NONE;
        onPrompt(result);
        onPrompt = (_value: null | string) => {};
    }

</script>


{#if type !== DialogType.NONE}
<div class="absolute flex justify-center items-center w-full h-full bg-black/30 z-50 pointer-events-auto">
    <div class="px-8 py-7 bg-window-bg shadow-[0_0_3px_3px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden">
        {#if type === DialogType.ERROR}
            <WindowFileDialogError onclose={() => {type = DialogType.NONE}} message={message}/>
        {:else if type === DialogType.PROMPT}
            <WindowFileDialogPrompt 
                onconfirm={value => promptExit(value)}
                oncancel={() => promptExit(null)}
                {...promptInfo}
                />
        {/if}
    </div>
</div>
{/if}