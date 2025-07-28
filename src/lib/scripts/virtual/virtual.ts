import { FileType, type BaseFile, type DirectoryFile, type RegFile } from "$scripts/fs";

export enum FileAttribute {
    NAME = "name",
    PARENT = "parent",
    FILE_CONTENTS = "file contents",
    DIRECTORY_FILES = "file list"
}

export interface Accessor<T, U extends VirtualFile> {
    get?(file: U, get: () => T): T;
    set?(value: T, file: U, set: (val: T) => void): void;
}


type ClassMethodDecorator<T> = (value: T, context: ClassMethodDecoratorContext)
    => T | void;

// registers a function that returns an accessor
export function register<T, U extends VirtualFile>(attribute: FileAttribute)
    : ClassMethodDecorator<() => Accessor<T, U>> {
    return (value, context) => {
        type InitializerFunc = (this: unknown) => void;
        context.addInitializer(function (this: VirtualSystem) {
            this.register(attribute, value);
        } as InitializerFunc); 
        return value;
    };
}



type FSMap = Map<FileAttribute, () => Accessor<unknown, VirtualFile>>;

// note that you can't put the decorator on a method instance of this class
// otherwise the initialization order will be wrong
// since on the derived class -> super() gets called first, which initializes the class
// then the method is registered
export abstract class VirtualSystem {
    #fsMap: FSMap;
    disableTracking: boolean;


    constructor() {
        this.#fsMap = new Map<FileAttribute, () => Accessor<unknown, VirtualFile>>();
        this.disableTracking = false;
    }


    operateGet<T>(attribute: FileAttribute, file: VirtualFile, get: () => T): T {
        const accessor = this.#fsMap.get(attribute);
        const func = accessor?.().get;
        if (func === undefined || this.disableTracking) {
            return get.call(file);
        }
        return func(file, get) as T;
    }

    operateSet<T>(attribute: FileAttribute, value: T, file: VirtualFile, set: (val: T) => void) {
        const accessor = this.#fsMap.get(attribute);
        const func = accessor?.().set;
        if (func === undefined || this.disableTracking) {
            set.call(file, value);
            return;
        }
        func(value, file, set as (val: unknown) => void);
    }

    // registers a function that returns an accessor
    register<T>(attribute: FileAttribute, func: () => Accessor<T, VirtualFile>) {
        func = func.bind(this);
        this.#fsMap.set(attribute, func);
    }    

    abstract createFile(file: RegFile): void;
    abstract createFolder(file: DirectoryFile): void;

    abstract relocate(file: BaseFile, parent: DirectoryFile): void;

    abstract remove(file: VirtualFile): void;
}



// a virtual file needs to have properties
// set to "tracked", this "synchronizes"
// the reads and writes of said property
export class VirtualFile {
    vfs: VirtualSystem
    idx: number;
    static counter = 0;


    constructor(vfs: VirtualSystem) {
        this.vfs = vfs;
        this.idx = VirtualFile.counter++;
        this.vfs.disableTracking = true;
    }

    // child needs to call create finished when done
    createFinished() {
        this.vfs.disableTracking = false;
    }

}


type ClassAccessorDecorator<T, U> = 
    (value: ClassAccessorDecoratorTarget<T, U>, 
    context: ClassAccessorDecoratorContext) =>
    ClassAccessorDecoratorResult<T, U>


export function tracked<T extends VirtualFile, U>(attribute: FileAttribute)
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
