import { DirectoryFile, RegFile } from "./fs.svelte";


function isFile(entry: FileSystemEntry): entry is FileSystemFileEntry {
    return entry.isFile;
}

async function readFileEntry(entry: FileSystemEntry, directory: DirectoryFile) {
    if (isFile(entry)) {
        const file = await new Promise<File>((res, rej) => {
            entry.file(res, rej);
        });
        
        let contents: string | ArrayBuffer = await file.arrayBuffer();
        try {
            contents = new TextDecoder("utf-8", {fatal: true}).decode(contents);
        } catch (e) {}

        const regFile = new RegFile(file.name, null, contents);
        directory.addFile(regFile, true);
        return;
    }
    const directoryEntry = entry as FileSystemDirectoryEntry;
    const dirFile = new DirectoryFile(directoryEntry.name, null);
    directory.addFile(dirFile, true);

    const entries = await new Promise<FileSystemEntry[]>((res, rej) => {
        directoryEntry.createReader().readEntries(res, rej);
    })
    
    for (const entry of entries) {
        readFileEntry(entry, dirFile);
    }
}


// process dragged files from the file system
export async function onFileDrop(items: DataTransferItemList, directory: DirectoryFile) {
    for (const item of items) {
        const entry = item.webkitGetAsEntry()!;
        try {
            await readFileEntry(entry, directory);
        } catch(e) {
            console.log(e);
        }
    }
}