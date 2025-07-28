// "Backend code"

// create the file system

import { defaultAction, extensionMap } from "./ui/extension.svelte";
import { FileAttribute, tracked, VirtualFile } from "./virtual/virtual";
import { IndexedDBVirtualSystem } from "./virtual/indexdb";
import { LoggerSystem } from "./virtual/logger";

export enum FileType {
    REG = "reg",
    DIR = "dir"
}

export interface JSONFS {
    cwd: string,
    files: SerializedFile
}

interface SerializedFile {
    name: string,
    type: FileType,
    contents: SerializedFile[] | string,
    binary?: boolean
}



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


export abstract class BaseFile extends VirtualFile {
    @tracked(FileAttribute.NAME)
    accessor name = "";

    @tracked(FileAttribute.PARENT)
    accessor parent: DirectoryFile | null;
    
    constructor(name: string, parent: DirectoryFile | null) {
        super(new LoggerSystem());
        this.name = name;
        this.parent = parent;
        if (this.parent !== null) {
            this.parent._addFile(this);
        }
    }

    get path() {
        let path = "";
        // root
        if (this.parent == null) {
            return path = "/";
        } else {
            // remove trailing slash
            path = this.parent.path!;
            path = path.replace(/\/$/g, '');
            path += "/" + this.name;
            
        }
        return path;
    }

    rename(name: string) {
        if (this.name == name) {
            return;
        }
        if (!this.isValidName(name)) {
            throw new Error("Invalid rename!");
        }
        this.name = name;
    }

    isValidName(name: string) {
        if (this.parent !== null) {
            const fileComp = this.parent.getFile(name);

            if (fileComp !== null) {
                return false;
            }
        }
        return !(name.length == 0 
            || name.length > 255
            || !name.match(/^[0-9a-zA-Z. \(\)]+$/));
    }


    abstract clone(parent: DirectoryFile): BaseFile;
    abstract open(): void; 

    // [base, extension, hasExtension?]
    splitExtension(filename?: string): [string, string, boolean] {
        if (filename === undefined) {
            filename = this.name;
        }
        const items = filename.split(".");
        
        if (items.length == 1) {
            // no extension
            return [items.at(-1)!, "", false];
        }

        const base = items.slice(0, -1).join(".");
        // has extension
        return [base, items.at(-1)!, true];
    }


    getExtension() {
        const [_1, extension, hasExtension] = this.splitExtension();
        if (hasExtension) {
            return extension;
        }
        return null;
    }


    abstract serialize(): Promise<SerializedFile>;

    // note that deserialize creates files to the file system
    // first arg is the serialized file after calling JSON.parse() on the file
    // second arg is the parent
    static async deserialize(serialized: SerializedFile, parent: DirectoryFile | null) {
        if (serialized.type == FileType.DIR) {
            const currentFile = new DirectoryFile(serialized.name, parent);
            for (const file of serialized.contents) {
               if (typeof(file) === "string") {
                    throw new Error("Wrong Content Type");
               }
                await this.deserialize(file, currentFile);
            }
            return currentFile;
        }

        if (serialized.type == FileType.REG) {
            
            if (typeof(serialized.contents) !== "string" ) {
                throw new Error("Wrong File Type");
            }
            let contents: string | ArrayBuffer = serialized.contents;
            // if it is a binary data it's base64 encoded
            if (serialized.binary) {
                contents = await fromBase64(serialized.contents);
            }
            if (parent === null) {
                throw new Error("File has no parent!")
            }

            return new RegFile(serialized.name, parent, contents);
        }
        throw new Error("Unknown File Type");
    }
}

export class RegFile extends BaseFile {
    @tracked(FileAttribute.FILE_CONTENTS)
    accessor contents: string | ArrayBuffer;
    
    constructor(name: string, parent: DirectoryFile, contents: string | ArrayBuffer) {
        super(name, parent);

        this.contents = contents;
        this.vfs.createFile(this);
        this.createFinished();
    }

     open() {
        const extension = this.name.split(".").at(-1)!;
        let func = extensionMap.get(extension);
        if (func === undefined) {
            // attempt to open as a txt file
            func = defaultAction;
        }
        func(this);
    }

    save(content: string) {
        this.contents = content;
    }

    clone(parent: DirectoryFile) {
        const file = new RegFile(this.name, parent, this.contents);
        return file;
    }

    async serialize(): Promise<SerializedFile> {
        let contents = this.contents;
        let binary = typeof(contents) !== "string";
        if (typeof(contents) !== "string") {
            // convert to base64
            contents = await toBase64(contents);
        }
        return {
            name: this.name,
            contents,
            type: FileType.REG,
            binary
        }
    }

    static isRegFile(file: BaseFile): file is RegFile {
        return (file as RegFile).contents !== undefined;
    }

    isBinary() {
        return typeof(this.contents) !== "string";
    }

    
    intoFile(mimeType: string) {
        let buffer: ArrayBuffer;
        if (typeof(this.contents) === "string") {
            buffer = new TextEncoder().encode(this.contents).buffer as ArrayBuffer;
        } else {
            buffer = this.contents;
        }
        return new File([buffer], this.name, {type: mimeType});
    }
}



export class DirectoryFile extends BaseFile {
    @tracked(FileAttribute.DIRECTORY_FILES)
    accessor files: BaseFile[] = []

    constructor(name: string, parent: DirectoryFile | null, virtual = false) {
        super(name, parent);
        // folder is not root, but parent is null
        if (this.name !== "" && this.parent === null && !virtual) {
            throw new Error("Non root folder has no parent!");
        }

        // needed to prevent the reactive directory from unnecessarily creating a new folder
        if (!virtual) {
            this.vfs.createFolder(this);
        }

        this.createFinished();
    }

    getFile(filename: string) {
        const arr = this.files.filter(file => file.name == filename);
        if (arr.length == 0) {
            return null;
        }
        return arr[0]!;
    }

    generateNewName(filename: string) {
        const [curBaseFull, curExt, curHasExt] = this.splitExtension(filename);
        const curBase = curBaseFull.replace(/ \([0-9]+\)$/, "");
        const unavailableIndices = [];
        for (const iterFile of this.files) {
            const [base, ext, hasExt] = iterFile.splitExtension();

            if (ext === curExt && hasExt === curHasExt) {

                // extension base is the same
                if (base == curBase) {
                    unavailableIndices.push(0);
                    continue;
                }
                // basename "hello (0)"

                const match = base.match(new RegExp(`${curBase} \\((?<id>[0-9]+)\\)$`));
                if (!match?.groups?.id) {
                    continue;
                }
                const num = parseInt(match!.groups?.id);
                unavailableIndices.push(num);
            }
        }

        if (unavailableIndices.length == 0) {
            return `${curBase}${curHasExt ? "." : ""}${curExt}`;
        }

        
        let highestIndex = 0;
        
        // this is so stupid (sort doesn't sort numbers by default)
        const indices = unavailableIndices
            .sort((a, b) => a - b);

        if (unavailableIndices[0] !== 0) {
            return `${curBase}${curHasExt ? "." : ""}${curExt}`;
        }

        for (const index of indices) {
            if (index == highestIndex) {
                highestIndex += 1;
            }
        }
        return `${curBase} (${highestIndex})${curHasExt ? "." : ""}${curExt}`;
    }

   
    #createFileName(name: string, rename = false) {
        const fileCompare = this.getFile(name);
        if (fileCompare !== null) {
            if (!rename) {
                throw new Error("File with the same name exists!");
            }
            name = this.generateNewName(name);
        }
        return name;
    }

    // adds a file to a directory
    // does not trigger a system call
    _addFile(file: BaseFile, autorename = false) {
        const name = this.#createFileName(file.name, autorename);
        if (name != file.name) {
            // file has already been added
            file.rename(this.generateNewName(file.name));
        }
        file.parent = this;
        this.files.push(file);
    }
    

    // creates an empty file
    createFile(
        name: string, 
        contents: string | ArrayBuffer, 
        autorename = false
    ) {
        const filename = this.#createFileName(name, autorename);
        return new RegFile(filename, this, contents);
    }

    // creates an empty folder
    createFolder(
        name: string,
        autorename = false
    ) {
        const filename = this.#createFileName(name, autorename);
        return new DirectoryFile(filename, this);
    }
    

    relocate(file: BaseFile, autorename = false) {
        file.parent?.removeFile(file, true);
        this._addFile(file, autorename);
        // call the relocate system call
        this.vfs.relocate(file, this);
    }

    // temporary removes are for relocation
    // logically removes the file without triggering the system call
    removeFile(file: BaseFile, temporary = false) {
        const index = this.files.findIndex(theFile => theFile.idx == file.idx);
        if (index === -1) {
            return;
        }

        this.files.splice(index, 1);

        if (!temporary) {
            // call remove "system call" to update the database
            this.vfs.remove(file);
        }
    }

    static isDirectory(file: BaseFile): file is DirectoryFile {
        return (file as DirectoryFile).files !== undefined;
    }

    open() {
        FileSystem.fs.changeDirectory(this);
    }

    clone(parent: DirectoryFile) {
        const directory = parent.createFolder(this.name, true)
        for (const file of this.files) {
            file.clone(directory);
        }
        return directory;
    }

    // check if "this" is an ancestor of dir
    isAncestor(dir: DirectoryFile | null): boolean {
        if (dir === null) {
            return false;
        }
        if (dir.idx === this.idx) {
            return true;
        }
        return this.isAncestor(dir.parent);
    }

    async serialize() {
        return {
            name: this.name,
            type: FileType.DIR,
            contents: await Promise.all(
                this.files.map(async (file) => file.serialize())
            )
        }
    }
}

export class FileSystem {
    root: DirectoryFile;
    #cwd!: DirectoryFile;

    get cwd() {
        return this.#cwd;
    }
    set cwd(dir: DirectoryFile) {
        if (this.findFile(dir.path) === null) {
            throw new Error("Can't change to a directory that does not exist!");
        }
        this.#cwd = dir;
    }
    
    history: DirectoryFile[];
    backHistory: DirectoryFile[];

    // singleton pattern
    static fs: FileSystem;

    constructor(root: DirectoryFile, cwd: DirectoryFile) {
        this.#cwd = cwd;
        this.root = root;
        this.history = [cwd];
        this.backHistory = [];
    }
    
    // given a directory and a path
    // find the file specified by the path
    findFile(path: string) {
        function helper(dir: DirectoryFile, path: string[]) {
            const [first, ...rest] = path;
            const final = dir.files.filter(file => file.name == first);
            
            if (final.length == 0) {
                return null;
            }

            // no more items left
            if (rest.length == 0) {
                return final[0];
            }
        
            if (!DirectoryFile.isDirectory(final[0])) {
                return null
            }
            
            return helper(final[0], rest);
        }

        const [first, ...rest]  = path.split("/");
        const dir = first === "" ? this.root : this.cwd;
        return helper(dir, rest);
    }

    static async fromJson(jsonFile: JSONFS) {
        const root = await BaseFile.deserialize(jsonFile.files, null);
        if (!DirectoryFile.isDirectory(root)) {
            throw new Error("Root is not a directory!");
        }


        const fs = new FileSystem(root, root);
        // the starting folder is not root
        if (jsonFile.cwd.split("/").at(0) !== "") {
            throw new Error("Invalid cwd path! Cwd needs to start with /.");
        }

        const cwd = fs.findFile(jsonFile.cwd);
        if (cwd === null || !DirectoryFile.isDirectory(cwd)) {
            throw new Error("Current working directory not found!");
        }

        fs.cwd = cwd;
        fs.history = [cwd];

        return fs;
    }


    async serialize() {
        return {
            // don't save the working directory
            cwd: "/home",
            files: await this.root.serialize()
        }
    }
    

    addEmptyFile(filename = "empty.txt") {
        return this.cwd.createFile(filename, "",  true);
    }

    addEmptyFolder(foldername = "folder") {
        const folder = this.cwd.createFolder(foldername, true);
        return folder;
    }

    removeFile(file: BaseFile) {
        this.cwd.removeFile(file);
    }

    changeDirectory(dir: DirectoryFile) {
        this.cwd = dir;
        this.history.push(dir);
        this.backHistory = [];
    }


    getFile(filename: string) {
        const arr = this.cwd.getFile(filename);
        if (arr === null) {
            throw new Error("File not found!");
        }
        return arr;
    }

    createFile(name: string, contents: string | ArrayBuffer) {
        return this.cwd.createFile(name, contents, true);
    }

    rename(file: BaseFile, name: string) {
        file.rename(name);
    }
   

    move(file: BaseFile, folder: DirectoryFile, autorename = false) {
        // check if source folder is ancestor of destination folder
        // destination folder won't have ancestor
        if (DirectoryFile.isDirectory(file) && file.isAncestor(folder)) {
            throw new Error("Can't put a directory inside of itself");
        }
        // check if folder already contains the file
        if (folder.getFile(file.name) !== null) {
            return;
        }
        // relocate the file to the
        folder.relocate(file, autorename);

    }

    copy(file: BaseFile, folder: DirectoryFile) {
        // check if source folder is ancestor of destination folder
        // destination folder won't have ancestor
        if (DirectoryFile.isDirectory(file) && file.isAncestor(folder)) {
            throw new Error("Can't copy a directory inside of itself");
        }

        file.clone(folder);
    }

    hasBack() {
        return this.history.length > 1;
    }

    hasForward() {
        return this.backHistory.length != 0;
    }

    back() {
        if (this.history.length <= 1) {
            return;
        }
        this.backHistory.push(this.history.at(-1)!);
        this.history.pop();
        this.cwd = this.history.at(-1)!;
    }

    forward() {
        if (this.backHistory.length == 0) {
            return;
        }
        this.cwd = this.backHistory.at(-1)!;
        this.history.push(this.cwd);
        this.backHistory.pop();
    }

    // get index of a file with a certain filename
    getIndex(file: BaseFile) {
        return this.cwd.files.findIndex(cmp => cmp.name == file.name);
    }

    static async init(object: JSONFS) {
        FileSystem.fs = await FileSystem.fromJson(object);
        return FileSystem.fs;
    }
}


