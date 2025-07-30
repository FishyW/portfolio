import { DirectoryFile, RegFile, type BaseFile } from "$scripts/fs";
import { FileAttribute, VirtualSystem, register, type Accessor } from "./virtual";
import { showDirectoryPicker, FileSystemDirectoryHandle } from "native-file-system-adapter";

export class RealSystem extends VirtualSystem {
    constructor() {
        super();
        
    }
  
    createFile(file: RegFile): void {
    }


    createFolder(file: DirectoryFile): void {
       
    }

    // relocate called after the file has been relocated
    relocate(file: BaseFile, oldParent: DirectoryFile): void {
   
    }

    remove(file: BaseFile) {
        
    }

    @register(FileAttribute.NAME)
    name(): Accessor<string, BaseFile> {
        return {
            set(value, file, set) {
                set.call(file, value);
            }
        }
    }

    @register(FileAttribute.FILE_CONTENTS)
    contents(): Accessor<string | ArrayBuffer, BaseFile> {
        return {
            set(value, file, set) {
                set.call(file, value);
            }
        }
    }

    static async #navigate(dir: FileSystemDirectoryHandle, path: string[]) {
        console.log(dir, path);
    }

    static async init(path: string) {
        const dir = await showDirectoryPicker();
        this.#navigate(dir, path.split("/"));
        return new RealSystem();
    }

}
