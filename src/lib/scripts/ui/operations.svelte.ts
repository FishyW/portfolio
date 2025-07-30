// file UI operations
import { BaseFile, DirectoryFile, RegFile, fileSystem } from './fs.svelte';
import { renamePrompt, updateFile } from '$components/WindowFileElement.svelte';
import { focus as windowFileFocus, selected } from "$components/WindowFile.svelte"
import { decrypt, encrypt } from '../crypto';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import { IndexedDBSystem } from '$scripts/virtual/indexdb';
import { VFSMap } from './config.svelte';
import { SpecialFile } from '$scripts/fs';

type Operation = "MOVE" | "COPY";

type PasteBuffer = { file?: BaseFile, operation?:  Operation, active?: boolean };

export let pasteBuffer: PasteBuffer = $state({});

export function newFile() {
    const file = fileSystem.addEmptyFile();
    console.log(file.vfs);
    console.log(file.vfs.isRenameSupported);
    if (file.vfs.isRenameSupported) {
        renamePrompt(file.name);
    }
    
}

export function newFolder() {
    const folder = fileSystem.addEmptyFolder();
    if (folder.vfs.isRenameSupported) {
        renamePrompt(folder.name);
    }
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
    if (selected.file.vfs.isRenameSupported) {
        renamePrompt(selected.file.name);
    }
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


export async function encryptFile() {
    if (selected.file === null) {return;}
    const password = window.prompt("Set a password");
    if (password === null) {
        return;
    }
    const serialized = JSON.stringify(await IndexedDBSystem.serialize(selected.file));
    const encrypted = await encrypt(password, serialized);


    const extension = DirectoryFile.isDirectory(selected.file) ? ".encdir" : ".enc";
    // add extension
    const newName = selected.file.name + extension;
    // adds to working directory
    fileSystem.createFile(newName, encrypted);
}

export async function decryptFile() {
    if (selected.file === null) {return;}
    const password = window.prompt("Enter password");
    if (password === null) {
        return;
    }
    if (!RegFile.isRegFile(selected.file)) {
        throw new Error("Not a file!");
    }

    if (typeof(selected.file.contents) === "string") {
        throw new Error("Not a valid encrypted file!");
    }
    
    const serialized = await decrypt(password, selected.file.contents);
    if (serialized === null) {
        alert("Invalid password!");
        return;
    }
    
    const folder = fileSystem.addEmptyFolder("tmp");
    const file = await IndexedDBSystem.deserialize(JSON.parse(serialized), folder);
    const [base, _1, _2] = selected.file.splitExtension();
    file.rename(base);
    fileSystem.move(file, fileSystem.cwd, true);
    fileSystem.removeFile(folder);
}


function zipFolder(folder: DirectoryFile, dir: JSZip) {
    for (const file of folder.files) {
        if (RegFile.isRegFile(file)) {
            dir.file(file.name, file.contents, {binary: file.isBinary()});
            continue;
        }
        const newDir = dir.folder(file.name)!;
        zipFolder(file as DirectoryFile, newDir);
    }
}

export async function download() {
    if (selected.file === null) {return;}
    if (RegFile.isRegFile(selected.file) || SpecialFile.isSpecFile(selected.file)) {
        saveAs(new File([await selected.file.contents], selected.file.name));
        return;
    }

    const zip = JSZip();
    zipFolder(selected.file as DirectoryFile, zip);
    const content = await zip.generateAsync({type:"blob"});
    saveAs(content, selected.file.name + ".zip")
}

export async function mount(mountPath: string) {
    if (selected.file === null) {
        return;
    }
    let scheme = "";
    const path = mountPath.replace(/^([a-zA-Z]+):\/\//g, 
        (_m, n1, _o, _s) => {
            scheme = n1;
            return "";
        })

    const vfs = await VFSMap[scheme].init(path, selected.file );
    selected.file.mount(vfs);
    updateFile(selected.file.name);
}

export function unmount() {
    if (!selected.file) {
        return;
    }
    
    selected.file?.unmount();
    if (selected.file !== null)
        updateFile(selected.file.name);
}