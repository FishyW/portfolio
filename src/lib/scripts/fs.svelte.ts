// "Backend code"

// create the file system

import { defaultAction, extensionMap } from "./extension.svelte";

enum JSONFileContent {
    REG = "reg",
    DIR = "dir"
}

interface JSONFS {
    cwd: string,
    files: SerializedFile
}

interface SerializedFile {
    name: string,
    type: JSONFileContent,
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


export abstract class BaseFile {
    name = "";
    parent: DirectoryFile | null;
    idx: number;
    static counter = 0;
    
    constructor(name: string, parent: DirectoryFile | null) {
        this.name = name;
        this.parent = parent;
        if (this.parent !== null) {
            this.parent.addFile(this);
        }
        this.idx = BaseFile.counter++;
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
    splitExtension(): [string, string, boolean] {
        const items = this.name.split(".");
        
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

    // first arg is the serialized file after calling JSON.parse() on the file
    // second arg is the parent
    static async deserialize(serialized: SerializedFile, parent: DirectoryFile | null) {
        if (serialized.type == JSONFileContent.DIR) {
            const currentFile = new DirectoryFile(serialized.name, parent);
            for (const file of serialized.contents) {
               if (typeof(file) === "string") {
                    throw new Error("Wrong Content Type");
               }
                currentFile.addFile(await this.deserialize(file, currentFile));
            }
            return currentFile;
        }

        if (serialized.type == JSONFileContent.REG) {
            
            if (typeof(serialized.contents) !== "string" ) {
                throw new Error("Wrong File Type");
            }
            let contents: string | ArrayBuffer = serialized.contents;
            // if it is a binary data it's base64 encoded
            if (serialized.binary) {
                contents = await fromBase64(serialized.contents);
            }

            return new RegFile(serialized.name, parent, contents);
        }
        throw new Error("Unknown File Type");
    }
}

export class RegFile extends BaseFile {
   contents: string | ArrayBuffer;
   
   constructor(name: string, parent: DirectoryFile | null, contents: string | ArrayBuffer) {
        super(name, parent);

        this.contents = contents;
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
        const file = new RegFile(this.name, null, this.contents);
        parent.addFile(file, true);
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
            type: JSONFileContent.REG,
            binary
        }
    }

    static isRegFile(file: BaseFile): file is RegFile {
        return (file as RegFile).contents !== undefined;
    }

    isBinary() {
        return typeof(this.contents) !== "string";
    }
}

export class DirectoryFile extends BaseFile {
    files: BaseFile[] = $state([])

    constructor(name: string, parent: DirectoryFile | null) {
        super(name, parent);
    }

    getFile(filename: string) {
        const arr = this.files.filter(file => file.name == filename);
        if (arr.length == 0) {
            return null;
        }
        return arr[0]!;
    }

    generateNewName(file: BaseFile) {
        const [curBaseFull, curExt, curHasExt] = file.splitExtension();
        const curBase = curBaseFull.replace(/ \([0-9]+\)$/, "");
        const unavailableIndices = [];
        for (const iterFile of file.parent!.files) {
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

    addFile(file: BaseFile, autorename = false) {
        const fileCompare = this.getFile(file.name);
        if (fileCompare !== null) {
            
            if (fileCompare.idx == file.idx) {
                return;
            }
            
            if (!autorename) {
                throw new Error("File with the same name exists!");
            }

            // file has already been added
            file.parent = this;

            file.rename(this.generateNewName(file));
        }
        file.parent = this;
        this.files.push(file);
    }

    removeFile(file: BaseFile) {
        this.files = this.files.filter(theFile => theFile != file);
    }

    static isDirectory(file: BaseFile): file is DirectoryFile {
        return (file as DirectoryFile).files !== undefined;
    }

    open() {
        FileSystem.fs.changeDirectory(this);
    }

    clone(parent: DirectoryFile) {
        const directory = new DirectoryFile(this.name, null);
        for (const file of this.files) {
            file.clone(directory);
        }
        parent.addFile(directory, true);
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
            type: JSONFileContent.DIR,
            contents: await Promise.all(
                this.files.map(async (file) => file.serialize())
            )
        }
    }
}

class FileSystem {
    root: DirectoryFile;
    cwd: DirectoryFile;
    
    history: DirectoryFile[];
    backHistory: DirectoryFile[];

    // singleton pattern
    static fs: FileSystem;

    constructor(root: DirectoryFile, cwd: DirectoryFile) {
        this.cwd = $state(cwd);
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
        const file = new RegFile(filename, null, "");
        this.cwd.addFile(file, true);
        return file;
    }

    addEmptyFolder(foldername = "folder") {
        const folder = new DirectoryFile(foldername, null);
        this.cwd.addFile(folder, true);
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

    addFile(file: BaseFile, autorename: boolean) {
        this.cwd.addFile(file, autorename);
        return file;
    }

    rename(file: BaseFile, name: string) {
        file.rename(name);
    }
   

    move(file: BaseFile, folder: DirectoryFile) {
        // check if source folder is ancestor of destination folder
        // destination folder won't have ancestor
        if (DirectoryFile.isDirectory(file) && file.isAncestor(folder)) {
            throw new Error("Can't put a directory inside of itself");
        }
        const parent = file.parent!;
        folder.addFile(file);
        parent!.removeFile(file);

    }

    copy(file: BaseFile, folder: DirectoryFile) {
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
        return fileSystem.cwd.files.findIndex(cmp => cmp.name == file.name);
    }

    static async init(object: JSONFS) {
        FileSystem.fs = await FileSystem.fromJson(object);
        return FileSystem.fs;
    }
}

import fsJson from "./fs.json";

// load 
import { browser } from "$app/environment";



let fs = await FileSystem.init(fsJson as JSONFS);

if (browser) {
    const fsStorage = localStorage.getItem("fs");
    if (fsStorage !== null) {
        fs = await FileSystem.init(JSON.parse(fsStorage));   
    }
} 


export const fileSystem = fs;


// alternatively use a "save decorator", 
// I'll do it if I'm dilligent enough
if (browser) {
    setInterval(async () => {
    localStorage.setItem("fs", JSON.stringify(await fs.serialize()));
    }, 1000);
}

