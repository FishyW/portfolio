import { DirectoryFile, fileSystem } from "./fs.svelte";
import { promptOnErrorAsync } from "./operations.svelte"; 

function isFile(entry: FileSystemEntry): entry is FileSystemFileEntry {
    return entry.isFile;
}

export async function readContents(file: File) {
   
    let contents: string | ArrayBuffer = await file.arrayBuffer();
    try {
        contents = new TextDecoder("utf-8", {fatal: true}).decode(contents);
    } catch (e) {}

    return contents;
}

async function readFileEntry(entry: FileSystemEntry, directory: DirectoryFile) {
    if (isFile(entry)) {
        const file = await new Promise<File>((res, rej) => {
            entry.file(res, rej);
        });
        
        const contents = await readContents(file);
        return directory.createFile(file.name, contents, true);
    }

    const directoryEntry = entry as FileSystemDirectoryEntry;
    const dirFile = directory.createFolder(directoryEntry.name, true);

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
class FileDrop {
    @promptOnErrorAsync
    static async onFileDrop(items: DataTransferItemList, directory: DirectoryFile) {
        for (const item of items) {
            if (item.kind === "string") {
                await moveVirtualFile(item, directory);
                continue;
            }

            const entry = item.webkitGetAsEntry()!;
            await readFileEntry(entry, directory);
        }
    }
}

export const onFileDrop = FileDrop.onFileDrop;