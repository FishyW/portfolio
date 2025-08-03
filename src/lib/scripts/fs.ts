// "Backend code"

// create the file system

import { defaultAction, extensionMap, MainFS, openTxt } from "./ui/config.svelte";
import { FileAttribute, tracked, VirtualSystemFile, VirtualSystem } from "./virtual/virtual";
import { FileType, IndexedDBSystem, type Serialized, type SerializedFile, type SerializedFolder, type SerializedJSON, type SerializedSpec } from "./virtual/indexdb";
import { EphemeralSystem } from "./virtual/ephemeral";


export abstract class BaseFile extends VirtualSystemFile {
    @tracked(FileAttribute.NAME)
    accessor name = "";

    @tracked(FileAttribute.PARENT)
    accessor parent: DirectoryFile | null;
    #savedName: string;
    
    constructor(name: string, parent: DirectoryFile | null) {
        super(new MainFS());
        this.isVirtual = parent !== null ? parent.isVirtual : false;
        this.vfs = parent !== null ? parent.vfs : this.vfs;

        this.name = name;
        this.parent = parent;
        this.#savedName = name; 
             
        if (this.parent !== null) {
            this.parent.addFile(this);
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
            || !name.match(/^[0-9a-zA-Z.\-_ \(\)]+$/));
    }


    abstract clone(parent: DirectoryFile, _autorename: boolean): BaseFile;
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

    pathJoin(other: string[], sep="/") {
        
        return [this.path, ...other]
            .join(sep).replace(new RegExp(sep+'{1,}', 'g'), sep);
    }

    mount(vfs: VirtualSystem) {
        this.#savedName = this.name;
        super.mount(vfs);
        this.vfs.mount(this);
    }

    unmount(): void {
        this.vfs.disableTracking = true;
        this.name = this.#savedName;
        this.vfs.disableTracking = false;
        
        super.unmount();
    }

    abstract serialize(): Serialized;

    getType(): FileType  {
        if (DirectoryFile.isDirectory(this)) {
            return FileType.DIR;
        }
        if (RegFile.isRegFile(this)) {
            return FileType.REG;
        }
        if (SpecialFile.isSpecFile(this)) {
            return FileType.SPEC;
        }
        return FileType.INVALID
    }

    
}

export class RegFile extends BaseFile {
    @tracked(FileAttribute.FILE_CONTENTS)
    accessor contents: string | ArrayBuffer;
    
    #savedContents;
    regFile;

    constructor(name: string, parent: DirectoryFile, contents: string | ArrayBuffer) {
        super(name, parent);
        this.contents = contents;
        this.#savedContents = contents;
        this.regFile = true;

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

    clone(parent: DirectoryFile, autorename = false) {
        const file = parent.createFile(this.name, this.contents, autorename);
        return file;
    }

    serialize(): SerializedFile {
        return {
            name: this.name,
            idx: this.idx,
            contents: this.contents,
            type: FileType.REG,
            binary: typeof(this.contents) !== "string"
        }
    }

    static isRegFile(file: BaseFile): file is RegFile {
        return (file as RegFile).regFile !== undefined;
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

    mount(vfs: VirtualSystem) {
        this.#savedContents = this.contents;

        this.vfs.disableTracking = true;
        this.contents = "";
        this.vfs.disableTracking = false;
        super.mount(vfs);
    }

    unmount(): void {
        this.vfs.disableTracking = true;
        this.contents = this.#savedContents;
        this.vfs.disableTracking = false;
        super.unmount();
    }
}



export class DirectoryFile extends BaseFile {
    @tracked(FileAttribute.DIRECTORY_FILES)
    accessor files: BaseFile[] = []

    #savedFiles: BaseFile[] = [];
    

    constructor(name: string, 
        parent: DirectoryFile | null, 
        virtual = false
    ) {
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
    addFile(file: BaseFile, autorename = false) {
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
        const parent = file.parent;
        if (parent === null) {
            throw new Error("Can't relocate root!");
        }
        if (file.isBaseMount) {
            throw new Error("Can't move a mounted file!");
        }

        // copies the file to the new parent
        const newFile = file.clone(this, true);
        // remove the file from the old parent
        parent.removeFile(file);
        return newFile;
        
    }

    // temporary removes are for relocation
    // logically removes the file without triggering the system call
    removeFile(file: BaseFile, temporary = false) {
        if (file.isBaseMount) {
            throw new Error("Can't remove a mounted file!");
        }
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

    clone(parent: DirectoryFile, autorename = false) {
        const directory = parent.createFolder(this.name, autorename)
        for (const file of this.files) {
            file.clone(directory, autorename);
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

    serialize(): SerializedFolder  {
        return {
            name: this.name,
            idx: this.idx,
            contents: this.files.map(file => file.idx),
            type: FileType.DIR
        }
    }

    mount(vfs: VirtualSystem) {
        this.#savedFiles = this.files.slice();

        this.vfs.disableTracking = true;
        this.files = [];
        this.vfs.disableTracking = false;

        super.mount(vfs);
    }

    unmount(): void {
        this.vfs.disableTracking = true;
        this.files = this.#savedFiles;
        this.vfs.disableTracking = false;

        super.unmount();
    }
}

// similar to a regular file
// except its contents are virtual
// also its contents are not saved to the database
// similar in concept to special files in linux like device files
export class SpecialFile extends BaseFile {
    #generator;
    #identifier;
    #consumer;
    isSpecialFile;

    constructor(
        name: string, 
        parent: DirectoryFile,
        identifier: string,
        generator: () => Promise<string>,
        consumer: (value: string) => void,
    ) {
        super(name, parent);
        this.#identifier = identifier
        this.#generator = generator;
        this.#consumer = consumer;
        this.isSpecialFile = true;

        // no need to call create finished
        // tracking can and should be disabled
        // this.createFinished();
    }

    get contents() {
        return this.#generator();
    }

    set contents(value: Promise<string> | string) {
        if (typeof(value) !== "string") {
            throw new Error("Setting a promise instead of a string!");
        }
        this.#consumer(value);
    }

    serialize(): SerializedSpec {
        return {
            name: this.name,
            idx: this.idx,
            contents: this.#identifier,
            type: FileType.SPEC
        }
    }
    
    open() {
        openTxt(this);
    }

    clone(_: DirectoryFile): never {
        throw new Error("Can't copy special file!");
    }

    static isSpecFile(file: BaseFile): file is SpecialFile {
        return (file as SpecialFile).isSpecialFile !== undefined;
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

    
    constructor(root: DirectoryFile, cwdPath: string) {
        this.root = root;
        const cwd = this.#findDir(cwdPath);
        this.#cwd = cwd;
        
        this.history = [cwd];
        this.backHistory = [];
    }

    #findDir(path: string) {
        const segments = path.split("/");
        let children: BaseFile[] = [this.root];
        let child: BaseFile = this.root;
        for (const segment of segments) {
            child = children.find(file => file.name === segment)!;
            children = (child as DirectoryFile).files;
        }
        if (!DirectoryFile.isDirectory(child)) {
            throw new Error("Child is not a directory!");
        }
        return child;
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
        if (folder.getFile(file.name) !== null && !autorename) {
            return;
        }
        // relocate the file to the
        return folder.relocate(file, autorename);
    }

    copy(file: BaseFile, folder: DirectoryFile) {
        // check if source folder is ancestor of destination folder
        // destination folder won't have ancestor
        if (DirectoryFile.isDirectory(file) && file.isAncestor(folder)) {
            throw new Error("Can't copy a directory inside of itself");
        }

        return file.clone(folder, true);
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

    // init loads the filesystem from indexeddb
    static async init(serialized: SerializedJSON) {
        VirtualSystemFile.counter = 0;
        const root = await IndexedDBSystem.createFileSystem(serialized);
        FileSystem.fs = new FileSystem(root, "/home");
        return FileSystem.fs;
    }
}


export class VirtualRegFile extends RegFile {
    constructor(name: string, 
        parent: DirectoryFile, 
        contents: string | ArrayBuffer,
        vfs: VirtualSystem = new EphemeralSystem()
    ) {
        VirtualSystemFile.setVFS(new EphemeralSystem());
        // bypass the "root" check
        super("", parent, contents);
        this.name = name;
        this.vfs = vfs;
    }

    transform(vfs: VirtualSystem, parent: DirectoryFile) {
        const file = new VirtualRegFile(this.name, new VirtualDirectoryFile("", null), this.contents, vfs);
        file.parent = parent;
        return file;
    }
}

export class VirtualDirectoryFile extends DirectoryFile {
    constructor(name: string, 
        parents: DirectoryFile | null,
        vfs: VirtualSystem = new EphemeralSystem()
    ) {
        VirtualSystemFile.setVFS(new EphemeralSystem());
        super("", parents);
        this.name = name;
        this.vfs = vfs;
    }

    
    transform(vfs: VirtualSystem, parent: DirectoryFile) {
        const file = new VirtualDirectoryFile(this.name, null, vfs);
        file.parent = parent;
        return file;
    }
}

export type VirtualFile = VirtualDirectoryFile | VirtualRegFile;