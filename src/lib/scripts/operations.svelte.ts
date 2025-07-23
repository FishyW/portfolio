// file UI operations
import { BaseFile, DirectoryFile } from './fs.svelte';
import { fileSystem } from "./fs.svelte";
import { renamePrompt } from '$components/WindowFileElement.svelte';
import { focus as windowFileFocus, selected } from "$components/WindowFile.svelte"


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
    const removedFile = selected.file;
    const idx = fileSystem.getIndex(removedFile);
    if (idx == -1) {
        throw new Error("Selected file does not exist");
    }
    if (idx + 1 < fileSystem.cwd.files.length) {
        selected.file = fileSystem.cwd.files[idx + 1];
    } else if (idx - 1 >= 0) {
        selected.file = fileSystem.cwd.files[idx - 1];
    }
    
    fileSystem.removeFile(removedFile);
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
    windowFileFocus();
}

export function move() {
    if (selected.file === null) return;
    pasteBuffer.file = selected.file;
    pasteBuffer.operation = "MOVE";
    pasteBuffer.active = true;
    windowFileFocus();
}


export function paste() {
    if (pasteBuffer.file === undefined) {
        return;
    }

    const targetDir = fileSystem.cwd;

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


