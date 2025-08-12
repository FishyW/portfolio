// file UI operations
import { BaseFile, DirectoryFile, RegFile, fileSystem } from './fs.svelte';
import { getComponent, selected } from "$components/WindowFile.svelte"
import { decrypt, encrypt } from '../crypto';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import { IndexedDBSystem } from '$scripts/virtual/indexdb';
import { VFSMap } from './config.svelte';
import { SpecialFile } from '$scripts/fs';
import { openErrorDialog, prompt } from '$components/WindowFileDialog.svelte';
import { DecryptPromptInfo, EncryptPromptInfo } from './info';


type PasteOperation = "MOVE" | "COPY";

type PasteBuffer = { file?: BaseFile, operation?:  PasteOperation, active?: boolean };

export let pasteBuffer: PasteBuffer = $state({});

export function promptOnError(target: Function, context: ClassMethodDecoratorContext) {
    return function (...args: any[]) {
        try {
            const value = target(...args);
            if (typeof(value) === "object" && value.then !== undefined && value.catch !== undefined) {
                throw new Error("Object is potentially a promise!");
            }
            return value;
        } catch(e) {
            openErrorDialog((e as Error).message);
        }
    }
}

export function promptOnErrorAsync(target: Function, context: ClassMethodDecoratorContext) {
    return async function (...args: any[]) {
        try {
            const value = target(...args);
            if (typeof(value) !== "object" || value.then === undefined) {
                throw new Error("Object is not a promise!");
            }
            return await value;
        } catch(e) {
            openErrorDialog((e as Error).message);
        }
    }
}


export function select(file: BaseFile) {
    selected.file = file;
}

// static class, needed so that we can use TS decorators
class Operation {
    @promptOnError
    static fileOpen() {
        if (selected.file === null) return;
        selected.file.open();
    }

    @promptOnErrorAsync
    static async newFile() {
        const file = fileSystem.addEmptyFile();
        const component = await getComponent(file);
        const name = await component!.renamePrompt();
        file.rename(name);  
        component?.update();      
    }

    @promptOnErrorAsync
    static async newFolder() {
        const folder = fileSystem.addEmptyFolder();
        const component = await getComponent(folder);
        const name = await component!.renamePrompt();
        folder.rename(name);   
        component?.update();        
    }

    @promptOnError
    static removeFile() {
        if (selected.file === null) return;
        const removedFile = selected.file;
        const idx = fileSystem.getIndex(removedFile);
        if (idx == -1) {
            throw new Error("Selected file does not exist!");
        }
        if (idx + 1 < fileSystem.cwd.files.length) {
            selected.file = fileSystem.cwd.files[idx + 1];
        } else if (idx - 1 >= 0) {
            selected.file = fileSystem.cwd.files[idx - 1];
        }
        fileSystem.removeFile(removedFile);
    }

    @promptOnErrorAsync
    static async rename() {
        if (selected.file === null) return;

        const component = await getComponent(selected.file);
        
        const name = await component!.renamePrompt();
        selected.file.rename(name);   
        component?.update();
    }

    @promptOnError
    static copy() {
        if (selected.file === null) return;
        pasteBuffer.file = selected.file;
        pasteBuffer.operation = "COPY";
        pasteBuffer.active = true;
    }

    @promptOnError
    static move() {
        if (selected.file === null) return;
        pasteBuffer.file = selected.file;
        pasteBuffer.operation = "MOVE";
        pasteBuffer.active = true;
    }

    @promptOnError
    static paste() {
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

        let file: BaseFile | null = null;
        if (pasteBuffer.operation === "COPY") {
            file = fileSystem.copy(pasteBuffer.file!, targetDir);
        } else if (pasteBuffer.operation === "MOVE") {
            file = fileSystem.move(pasteBuffer.file!, targetDir) ?? null;
        }

        selected.file = file;
        pasteBuffer.active = false;
    }

    @promptOnErrorAsync
    static async encryptFile() {
        if (selected.file === null) {return;}
        const password = await prompt(EncryptPromptInfo);
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

    @promptOnErrorAsync
    static async decryptFile() {
        if (selected.file === null) {return;}
        const selectedFile = selected.file;
        const password = await prompt(DecryptPromptInfo);
        if (password === null) {
            return;
        }
        if (!RegFile.isRegFile(selectedFile)) {
            throw new Error("Not a file!");
        }

        if (typeof(selectedFile.contents) === "string") {
            throw new Error("Not a valid encrypted file!");
        }
        
        const serialized = await decrypt(password, selectedFile.contents);
        if (serialized === null) {
            throw new Error("Invalid password!");
        }
        
        const folder = fileSystem.addEmptyFolder("tmp");
        const file = await IndexedDBSystem.deserialize(JSON.parse(serialized), folder);
        const [base, _1, _2] = selectedFile.splitExtension();
        file.rename(base);
        fileSystem.move(file, fileSystem.cwd, true);
        fileSystem.removeFile(folder);
    }


    static zipFolder(folder: DirectoryFile, dir: JSZip) {
        for (const file of folder.files) {
            if (RegFile.isRegFile(file)) {
                dir.file(file.name, file.contents, {binary: file.isBinary()});
                continue;
            }
            const newDir = dir.folder(file.name)!;
            this.zipFolder(file as DirectoryFile, newDir);
        }
    }

    @promptOnErrorAsync
    static async download() {
        if (selected.file === null) {return;}
        if (RegFile.isRegFile(selected.file) || SpecialFile.isSpecFile(selected.file)) {
            saveAs(new File([await selected.file.contents], selected.file.name));
            return;
        }

        const zip = JSZip();
        this.zipFolder(selected.file as DirectoryFile, zip);
        const content = await zip.generateAsync({type: "blob"});
        saveAs(content, selected.file.name + ".zip")
    }

    @promptOnErrorAsync
    static async mount() {
        if (selected.file === null) {
            return;
        }
        const component = await getComponent(selected.file);
        const mountPath = await component!.mountPrompt();
        let scheme = "";
        const path = mountPath.replace(/^([a-zA-Z]+):\/\//g, 
            (_m, n1, _o, _s) => {
                scheme = n1;
                return "";
            })

        const vfs = await VFSMap[scheme].init(path, selected.file );
        selected.file.mount(vfs);

        component?.update();
    }

    @promptOnErrorAsync
    static async unmount() {
        if (!selected.file) {
            return;
        }
        
        selected.file?.unmount();
        if (selected.file === null) {
            return;
        } 

        const component = await getComponent(selected.file);
        component?.update();
    }

    @promptOnError
    static changeDirectory(directory: DirectoryFile) {
        fileSystem.changeDirectory(directory);
    }

    @promptOnError
    static back() {
        fileSystem.back();
    }

    @promptOnError
    static forward() {
        fileSystem.forward();
    }
}

export const {
    download, fileOpen, newFile, newFolder, 
    rename, mount, unmount, copy, 
    removeFile, move, paste, encryptFile, decryptFile,
    changeDirectory, forward, back
} = Operation;

