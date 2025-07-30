import type { BaseFile, DirectoryFile, RegFile } from "$scripts/fs";
import { FileAttribute, VirtualSystemFile, VirtualSystem, register, type Accessor } from "./virtual";


export class LoggerSystem extends VirtualSystem {
    
    createFile(file: RegFile): void {
        console.log(`CREATING FILE with index ${file.idx}`);
    }

    createFolder(file: DirectoryFile): void {
        console.log(`CREATING FOLDER with index ${file.idx}`);
    }

    remove(file: VirtualSystemFile): void {
        console.log(`REMOVING FILE with index ${file.idx}`);
    }

    @register(FileAttribute.NAME)
    name(): Accessor<string, BaseFile> {
        return {
            set(value, file, set) {
                console.log(`NAMING FILE TO ${value}`)
                set.call(file, value);
            },
            get(file, get) {
                return get.call(file);
            }
        }
    }

   

    @register(FileAttribute.FILE_CONTENTS)
    contents(): Accessor<string | ArrayBuffer, BaseFile> {
        return {
            set(value, file, set) {
                console.log(`SETTING CONTENTS TO ${value}`);
                set.call(file, value);
            },
            get(file, get) {
                return get.call(file);
            }
        }
    }

    // set calls to parent and files can and should be generally ignored
    // instead these calls should be handled by the
    // create file/folder and remove file system calls above
    @register(FileAttribute.PARENT)
    parent(): Accessor<DirectoryFile | null, BaseFile> {
        return {
            get(file, get) {
                return get.call(file);
            }
        }
    }

    @register(FileAttribute.DIRECTORY_FILES)
    files(): Accessor<DirectoryFile | null, BaseFile> {
        return {
            get(file, get) {
                return get.call(file);
            }
        }
    }
    
    static async init() {
        return new LoggerSystem();
    }
}