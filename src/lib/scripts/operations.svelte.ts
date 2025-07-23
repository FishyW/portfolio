// file UI operations
import { BaseFile, DirectoryFile } from './fs.svelte';
import { fileSystem } from "./fs.svelte";
import { renamePrompt } from '$components/WindowFileElement.svelte';
import { selected } from "$components/WindowFile.svelte"


type Operation = "MOVE" | "COPY";

type PasteBuffer = { file?: BaseFile, operation?:  Operation, active?: boolean };

export let pasteBuffer: PasteBuffer = $state({});

export function newFile() {
    const file = fileSystem.addEmptyFile();
    renamePrompt(file.name);
}

export function newFolder() {
    const folder = fileSystem.addEmptyFolder();
    renamePrompt(folder.name);
}

export function removeFile() {
    if (selected.file === null) return;
    fileSystem.removeFile(selected.file);
}

export function rename() {
    if (selected.file === null) return;
    renamePrompt(selected.file.name);
}

export function copy() {
    if (selected.file === null) return;
    pasteBuffer.file = selected.file;
    pasteBuffer.operation = "COPY";
    pasteBuffer.active = true;
}

export function move() {
    if (selected.file === null) return;
    pasteBuffer.file = selected.file;
    pasteBuffer.operation = "MOVE";
    pasteBuffer.active = true;
}


export function paste() {
    const targetDir = (selected.file && DirectoryFile.isDirectory(selected.file)) 
        ? selected.file : fileSystem.cwd;
    
    if (targetDir.path === pasteBuffer.file!.parent?.path 
        && pasteBuffer.operation === "MOVE") {
        pasteBuffer.file = undefined;
        pasteBuffer.active = false;
        return;
    }
    

    if (pasteBuffer.operation === "COPY") {
        fileSystem.copy(pasteBuffer.file!, targetDir);
    } else if (pasteBuffer.operation === "MOVE") {
        fileSystem.move(pasteBuffer.file!, targetDir);
    }
    pasteBuffer.active = false;
}