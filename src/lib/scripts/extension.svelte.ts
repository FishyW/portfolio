// Several Extension Managers
// When opening a file, the function in the map is called
import { RegFile } from "./fs.svelte";
import { open } from "$components/WindowManager.svelte";
import WindowTextEditor from "$components/WindowTextEditor.svelte";

function openTxt(file: RegFile) {
    open(WindowTextEditor, { file });
}


const extMap = {
    "txt": openTxt
};


export const extensionMap = new Map(Object.entries(extMap));
export const defaultAction = openTxt;