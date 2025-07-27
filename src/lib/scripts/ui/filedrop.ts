import { DirectoryFile, fileSystem, RegFile } from "./fs.svelte";


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



async function moveVirtualFile(item: DataTransferItem, directory: DirectoryFile) {
    const filename = await new Promise<string>((res, _) => item.getAsString(res));
    
    const selectedFile = fileSystem.getFile(filename);
    if (selectedFile === null) {
        return;
    }

    // folder being moved to itself
    if (selectedFile.name === directory.name) {
        return;
    }

    // move the selected file to the directory
    fileSystem.move(selectedFile, directory);
}

// process dragged files from the file system
export async function onFileDrop(items: DataTransferItemList, directory: DirectoryFile) {
    for (const item of items) {
        if (item.kind === "string") {
            moveVirtualFile(item, directory);
            continue;
        }

        const entry = item.webkitGetAsEntry()!;
        try {
            readFileEntry(entry, directory);
        } catch(e) {
            console.log(e);
        }
    }
}