import type { BaseFile, DirectoryFile } from "$scripts/fs";
import { FileAttribute, VirtualFile, VirtualSystem, register, type Accessor } from "./virtual";


export class IndexedDBVirtualSystem extends VirtualSystem {
    fileMap = new Map<number, VirtualFile>();
    

    @register(FileAttribute.NAME)
    name(): Accessor<string, BaseFile> {
        return {
            set(value, file, set) {
                set.call(file, value);
            },
            get(file, get) {
                return get.call(file);
            }
        }
    }

    @register(FileAttribute.PARENT)
    parent(): Accessor<DirectoryFile | null, BaseFile> {
        return {
            set(value, file, set) {
                set.call(file, value);
            },
            get(file, get) {
                return get.call(file);
            }
        }
    }

    @register(FileAttribute.FILE_CONTENTS)
    contents(): Accessor<DirectoryFile | null, BaseFile> {
        return {
            set(value, file, set) {
                set.call(file, value);
            },
            get(file, get) {
                return get.call(file);
            }
        }
    }

    @register(FileAttribute.DIRECTORY_FILES)
    files(): Accessor<DirectoryFile | null, BaseFile> {
        return {
            set(value, file, set) {
                set.call(file, value);
            },
            get(file, get) {
                return get.call(file);
            }
        }
    }
    
}