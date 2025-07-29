// reactive version of "$scripts/fs"

import fsJson from "../fs.json";

import { browser } from "$app/environment";
import { BaseFile, DirectoryFile, FileSystem } from "$scripts/fs";
import { VirtualFile } from "$scripts/virtual/virtual";
import { type SerializedJSON } from "$scripts/virtual/indexdb";


class ReactiveDirectory extends DirectoryFile {
    #filesInternal;

    constructor(
        name: string, 
        parent: null | DirectoryFile, 
        files: BaseFile[] = [],
        virtual = false
    ) {
        super(name, parent, virtual);
        this.#filesInternal = $state(files);
        
        // superGet is likely not needed, but for symmetric reasons I'll have it here
        // can be replaced by const superFiles = super.files;
        // then in the code below superFiles[prop] = value;
        const superGet = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(this).__proto__, 'files')!.get!
            .bind(this) as (() => BaseFile[]);

        // superSet is necessary
        // the set: function below can't be changed
        // since we need to do super.files = value, i.e. we need to pass in "super"
        // to the code block below, but this is not possible, so we need to pass in the setter
        const superSet = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(this).__proto__, 'files')!.set!
            .bind(this) as ((files: BaseFile[]) => void);
        
        // can likely be replaced by super.files = files
        superSet(files);
        
        // override instance property
        Object.defineProperty(this, "files", {
            get: () => {
                return new Proxy(this.#filesInternal, {
                    set(target, prop, value) {
                        // setting the reactive state does 2 things
                        // first it sets the parent object, writing the update to the database
                        // second it sets the value to the state, this triggers DOM updates
                        (superGet() as any)[prop] = value;
                        (target as any)[prop] = value;
                        return true;
                    }
                });
            },
            set: (value) => {
                this.#filesInternal = value;
                // super set is needed to update the parent data
                superSet(value);
            }
        })
    }

    static makeReactive(directory: DirectoryFile) {
        VirtualFile.counter -= 1;
        const dir = new ReactiveDirectory(
            directory.name, null, directory.files, true
        );

        // set all children's parent to point to the reactive directory
        for (const file of directory.files) {
            file.parent = dir;
        }

        Object.assign(dir, directory);
        
        dir.parent = directory.parent;

        return dir;
    }
}

class ReactiveFileSystem extends FileSystem {
    #cwdInternal;

    constructor(root: DirectoryFile, cwd: DirectoryFile) {
        super(root, cwd.path);
        this.#cwdInternal = $state(ReactiveDirectory.makeReactive(cwd));
        Object.defineProperty(this, "cwd", {
            get: () => this.#cwdInternal,
            set: (value) => {
                this.#cwdInternal = ReactiveDirectory.makeReactive(value);
            }
        })
    }

    static async init(fsFormat: SerializedJSON) {
        const fs = await FileSystem.init(fsFormat);
        const rfs =  new ReactiveFileSystem(fs.root, fs.cwd);
        FileSystem.fs = rfs;
        return rfs;
    }
}

let fs;

if (browser) {
    // IndexedDBSystem.createFileSystem(fsJson as SerializedJSON);
    fs = await ReactiveFileSystem.init(fsJson as SerializedJSON);
    // const fsStorage = IndexedDBSystem.ch
    // if (fsStorage !== null) {
    //     fs = await ReactiveFileSystem.init(JSON.parse(fsStorage));
    // }
} 


export const fileSystem = fs!;


export { 
    DirectoryFile, 
    RegFile, 
    BaseFile, 
    FileSystem 
} from "$scripts/fs";


