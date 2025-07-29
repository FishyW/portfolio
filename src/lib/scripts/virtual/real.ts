import { DirectoryFile, RegFile, type BaseFile } from "$scripts/fs";
import { FileAttribute, VirtualFile, VirtualSystem, register, type Accessor } from "./virtual";


export class RealSystem extends VirtualSystem {
    fileMap = new Map<number, VirtualFile>();
    
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

    static init(path: string) {
        
        return new RealSystem();
    }

}
