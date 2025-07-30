import { DirectoryFile, RegFile, type BaseFile } from "$scripts/fs";

export enum FileAttribute {
    NAME = "name",
    PARENT = "parent",
    FILE_CONTENTS = "file contents",
    DIRECTORY_FILES = "file list"
}

export interface Accessor<T, U extends VirtualSystemFile> {
    get?(file: U, get: () => T): T;
    set?(value: T, file: U, set: (val: T) => void): void;
}


type ClassMethodDecorator<T> = (value: T, context: ClassMethodDecoratorContext)
    => T | void;

// registers a function that returns an accessor
export function register<T, U extends VirtualSystemFile>(attribute: FileAttribute)
    : ClassMethodDecorator<() => Accessor<T, U>> {
    return (value, context) => {
        type InitializerFunc = (this: unknown) => void;
        context.addInitializer(function (this: VirtualSystem) {
            this.register(attribute, value);
        } as InitializerFunc); 
        return value;
    };
}



type FSMap = Map<FileAttribute, () => Accessor<unknown, VirtualSystemFile>>;

// note that you can't put the decorator on a method instance of this class
// otherwise the initialization order will be wrong
// since on the derived class -> super() gets called first, which initializes the class
// then the method is registered
export abstract class VirtualSystem {
    #fsMap: FSMap;
    disableTracking: boolean;
    isRenameSupported = true;
    
    constructor(..._args: any) {
        this.#fsMap = new Map<FileAttribute, () => Accessor<unknown, VirtualSystemFile>>();
        this.disableTracking = false;
    }


    operateGet<T>(attribute: FileAttribute, file: VirtualSystemFile, get: () => T): T {
        const accessor = this.#fsMap.get(attribute);
        const func = accessor?.().get;
        if (func === undefined || this.disableTracking) {
            return get.call(file);
        }
        return func(file, get) as T;
    }

    operateSet<T>(attribute: FileAttribute, value: T, file: VirtualSystemFile, set: (val: T) => void) {
        const accessor = this.#fsMap.get(attribute);
        const func = accessor?.().set;
        // if the file is the base mount don't forward any changes to the file system
        if (func === undefined || this.disableTracking) {
            set.call(file, value);
            return;
        }
        func(value, file, set as (val: unknown) => void);
    }

    // registers a function that returns an accessor
    register<T>(attribute: FileAttribute, func: () => Accessor<T, VirtualSystemFile>) {
        func = func.bind(this);
        this.#fsMap.set(attribute, func);
    }    

    abstract createFile(file: RegFile): void;
    abstract createFolder(file: DirectoryFile): void;

    abstract remove(file: BaseFile): void;
    
    // all implementers of init must call createFinished()
    static async init(_path: string, _file: BaseFile): Promise<VirtualSystem> {
        throw new Error("Not implemented!");
    }

    mount(file: BaseFile) {}
}



// a virtual file needs to have properties
// set to "tracked", this "synchronizes"
// the reads and writes of said property
export class VirtualSystemFile {
    vfs: VirtualSystem;
    idx: number;
    static counter = 0;
    isVirtual: boolean;
    mainVFS: VirtualSystem;
    isBaseMount: boolean;
    fileCopy: VirtualSystemFile | undefined;

    static #VFS: VirtualSystem | undefined;

    

    static setVFS(vfs: VirtualSystem) {
        this.#VFS = vfs;
    }

    constructor(vfs: VirtualSystem) {

        if (VirtualSystemFile.#VFS !== undefined) {
            vfs = VirtualSystemFile.#VFS;
            VirtualSystemFile.#VFS = undefined;
        }
        this.vfs = vfs;
        this.isBaseMount = false;
        this.mainVFS = vfs;
        this.idx = VirtualSystemFile.counter++;
        this.vfs.disableTracking = true;
        this.isVirtual = false;
    }

    // child needs to call create finished when done
    createFinished() {
        this.vfs.disableTracking = false;
    }

    // switch vfs
    mount(vfs: VirtualSystem) {
        this.isVirtual = true;
        this.isBaseMount = true;
        this.mainVFS = this.vfs;
        this.vfs = vfs;
    }

    unmount() {
        this.isVirtual = false;
        this.isBaseMount = false;
        this.vfs = this.mainVFS;
    }
}


type ClassAccessorDecorator<T, U> = 
    (value: ClassAccessorDecoratorTarget<T, U>, 
    context: ClassAccessorDecoratorContext) =>
    ClassAccessorDecoratorResult<T, U>


export function tracked<T extends VirtualSystemFile, U>(attribute: FileAttribute)
    : ClassAccessorDecorator<T, U> {
    return (val, _2) => {
        let {get, set} = val;
        return  {
            get() {
                
                return this.vfs.operateGet(attribute, this, get);
            },
            set(val) {
                return this.vfs.operateSet(attribute, val, this, set);
            }
        };
    };
}


