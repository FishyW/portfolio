import { browser } from "$app/environment";
import { DirectoryFile, RegFile, SpecialFile, type BaseFile } from "$scripts/fs";
import { specGenMap } from "./special";
import { FileAttribute, VirtualSystemFile, VirtualSystem, register, type Accessor } from "./virtual";

export enum FileType {
    REG = "reg",
    DIR = "dir",
    SPEC = "spec",
    INVALID = "invalid"
}

// used for the indexed db database
export interface SerializedFile {
    name: string,
    idx: number,
    contents: string | ArrayBuffer,
    binary: boolean,
    type: FileType.REG
}

export interface SerializedFolder {
    name: string,
    idx: number,
    contents: number[],
    type: FileType.DIR
}

export interface SerializedSpec {
    name: string,
    idx: number,
    contents: string,
    type: FileType.SPEC
}


export type Serialized = SerializedFolder | SerializedFile | SerializedSpec
export type SerializedJSON = Serialized[];

// convert to base64 based on
// https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
// likely the fastest solution since it uses native browser features
// doesn't exactly convert to a base64 string, it converts to a base64 "url"
async function toBase64(buffer: ArrayBuffer) {
  // use a FileReader to generate a base64 data URI:
  const base64url = await new Promise(r => {
    const reader = new FileReader()
    reader.onload = () => r(reader.result)
    reader.readAsDataURL(new Blob([buffer]))
  });
  return base64url as string;
}

async function fromBase64(data: string) {
    return (await (await fetch(data))
        .arrayBuffer());
}   
class Database {
    static db?: IDBDatabase;

    static async getDB() {
        if (!browser) {
            return;
        }

        if (this.db === undefined) {
            this.db = await this.constructDB();
            this.db.onerror = e => {
                throw new Error("Error when reading/writing to the database!")
            }
        }  
        return this.db;
    }

    static async constructDB(): Promise<IDBDatabase> {
        return new Promise((res, rej) => {
            const req = window.indexedDB.open('FileSystemDatabase');
            req.onsuccess = _ => {
                res(req.result);
            }
            req.onerror = _ => {
                rej("Can't open database!")
            }
            req.onupgradeneeded = (_  => {
                req.result.createObjectStore('files', {keyPath: "idx"});
        })
    });
}
}

if (browser) {
    Database.constructDB();
}


export class IndexedDBSystem extends VirtualSystem {
    fileMap = new Map<number, VirtualSystemFile>();
    
    update(file: BaseFile) {
        Database.getDB().then(async db => {
            // note that put updates if it exists 
            // or inserts if it doesn't
            const store = db?.transaction(['files'], "readwrite")
                .objectStore("files")

            store?.put(file.serialize());
            if (file.parent == null) {
                return;
            }
            store?.put(file.parent.serialize());
        })
    }

    removeOne(file: BaseFile): void {
        Database.getDB().then(async db => {
            // note that put updates if it exists 
            // or inserts if it doesn't
            const store = db?.transaction(['files'], "readwrite")
                .objectStore("files");
            
            store?.delete(file.idx);

            if (file.parent == null) {
                return;
            }
            // update parent files
            store?.put(file.parent.serialize());
        })
    }

    remove(file: BaseFile): void {
        if (RegFile.isRegFile(file)) {
            this.removeOne(file);
            return;
        }
        if (DirectoryFile.isDirectory(file)) {
            for (const dirItem of file.files) {
                this.remove(dirItem);
            }
        }
        this.removeOne(file);
    }

    createFile(file: RegFile): void {
        this.update(file);
    }


    createFolder(file: DirectoryFile): void {
        // root folder doesn't have index 0
        if (file.idx === 0 && file.name !== "") {
            throw new Error("Root folder does not have index 0");
        }
        this.update(file);
    }

    @register(FileAttribute.NAME)
    name(): Accessor<string, BaseFile> {
        const update = this.update;
        return {
            set(value, file, set) {
                set.call(file, value);
                update(file);
            }
        }
    }

    @register(FileAttribute.FILE_CONTENTS)
    contents(): Accessor<string | ArrayBuffer, BaseFile> {
        const update = this.update;
        return {
            set(value, file, set) {
                set.call(file, value);
                update(file);
            }
        }
    }

    // serialize the entire store
    // it carefully converts binary data to base64
    static async serializeFromStore() {
        const data: SerializedJSON = await new Promise((res, rej) => {
            Database.getDB().then(db => {
                const req = db!.transaction(['files'], "readonly")
                    .objectStore('files')
                    .getAll();
                    
                req.onerror = () => {
                    rej("Can't retrieve files from store!");
                }
                req.onsuccess = () => res(req.result);
            })
        });

        return Promise.all(data.map(async item => {
            // if item is in binary format
            if (item.type == FileType.REG && item.binary) {
                item.contents = await toBase64(item.contents as ArrayBuffer);
            }
            return item;
        }));

    }

    // converts base64 data to binary 
    static async #prepareJSON(
        serializedFiles: SerializedJSON
    ) {
        for (const file of serializedFiles) {
            if (file.type === FileType.REG && file.binary) {
                file.contents = await fromBase64(file.contents as string);
            }
        }
        return serializedFiles;
    }


    // converts JSON object and writes to the object store
    static async deserializeToStore(serializedFiles: SerializedJSON) {
        serializedFiles = await this.#prepareJSON(serializedFiles);

        return new Promise<void>((res, rej) => {
            Database.getDB().then(db => {
            const store = db!.transaction(['files'], "readwrite")
                .objectStore('files');
            
            serializedFiles.forEach(file => {
                store.put(file);
            })

            store.transaction.oncomplete = () => {
                res();
            }

            store.transaction.onerror = () => {
                rej("Failed to deserialize!");
            }
        })})
    }

    // given a root, serialize the file system
    // this serializes to a "JSON safe" string"
    static async serialize(root: BaseFile): Promise<SerializedJSON> {
        // note that the root is always the first element in the array
        const serialized = root.serialize();
        if (RegFile.isRegFile(root)) {
            if (typeof(root.contents) !== "string") {
                serialized.contents = await toBase64(root.contents);
            }
            return [serialized];
        }
        let serializedFiles = [serialized];
        if (DirectoryFile.isDirectory(root)) {
            for (const child of root.files) {
                const serializedChild = await this.serialize(child);
                serializedFiles = serializedFiles.concat(serializedChild);
            }
        }
        return serializedFiles;
    }

    // opposite of serialize, assumes that the root is the first file found
    // writes the file data to disk
    static async deserialize(file: SerializedJSON, parent: DirectoryFile) {
        file = await this.#prepareJSON(file);
        return this.loadFileSystem(file, file[0].idx, parent);
    }

    // loads a file system 
    static loadFileSystem(
        data: SerializedJSON,
        rootIndex = 0,
        parent: null | DirectoryFile = null
    ) {
         function createTree(
            file: Serialized,
            parent: null | DirectoryFile
        ) {
            if (file.type === FileType.REG) {
                if (parent === null) {
                    throw new Error("Parent of a regular file is null!");
                }
                return new RegFile(file.name, parent, file.contents);
            }
            if (file.type === FileType.SPEC) {
                if (parent === null) {
                    throw new Error("Parent of a regular file is null!");
                }
                return new SpecialFile(file.name, parent, file.contents, 
                    ...specGenMap[file.contents]);
            }
            const dir = new DirectoryFile(file.name, parent);
            for (const dirNum of file.contents) {
                const serializedFile = data.find(file => file.idx === dirNum);
                if (serializedFile === undefined) {
                    throw new Error("Directory contents contain a file index that does not exist!");
                }
                createTree(serializedFile, dir);
            }
            return dir;
        }
        
        const root = data.find(file => file.idx === rootIndex);
        
        if (root?.name !== "" && rootIndex === 0 || root === undefined) {
            throw new Error("Root does not have index 0!");
        }

        return createTree(root, parent);
    }

    // no fallback
    static async #createFileSystem() {
        const data: SerializedJSON = await new Promise((res, rej) => 
            Database.getDB().then(db => {
            const req = db!
                .transaction(['files'], 'readonly')
                .objectStore('files')
                .getAll();
            req.onsuccess = () => res(req.result);
        }));

        // after we retrieve the object store 
        // now we clear it, since each time we create a new file
        // this writes to the object store
        await new Promise((res, _) => {
            Database.getDB().then(db => {
                const req = db!
                    .transaction(['files'], 'readwrite')
                    .objectStore('files')
                    .clear()
                req.onsuccess = res;
            })
        })
       return this.loadFileSystem(data);
    }

    // returns a new file system
    // pass in a fallback and create a file system based on that
    // if the fallback isn't found
    static async createFileSystem(fallback: SerializedJSON): Promise<DirectoryFile> {
        let file: BaseFile;
        try {
            file = await this.#createFileSystem();
        } catch(e) {
            fallback = await this.#prepareJSON(fallback);
            file = this.loadFileSystem(fallback);
        }
        if (!DirectoryFile.isDirectory(file)) {
            throw new Error("Root folder is not a directory!");
        }
        return file;

    }

    static async reset(): Promise<void> {
        return new Promise(async (res, rej) => {
            const db = await Database.getDB();
            db?.close();

            const req = indexedDB.deleteDatabase('FileSystemDatabase');
            req.onsuccess = () => {
                res();
            };
            req.onblocked = () => {
                res();
            }
            req.onerror = () => {
                rej("Can't delete database!");
            }
        })
    }
}
