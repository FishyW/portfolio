import { DirectoryFile, RegFile, type BaseFile } from "$scripts/fs";
import { FileAttribute, VirtualSystem, register, type Accessor } from "./virtual";


export class EphemeralSystem extends VirtualSystem {
    
    createFile(file: RegFile): void {
    }


    createFolder(file: DirectoryFile): void {
       
    }

    // relocate called after the file has been relocated
    relocateOldParent(file: BaseFile, oldParent: DirectoryFile): void {}

    relocateChild(file: BaseFile, oldParent: DirectoryFile): void {}

    relocateNewParent(file: BaseFile, oldParent: DirectoryFile): void {}

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

    static async init() {
        return new EphemeralSystem();
    }

}
