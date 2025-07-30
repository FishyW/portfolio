import { DirectoryFile, RegFile, VirtualDirectoryFile, VirtualRegFile, type BaseFile, type VirtualFile } from "$scripts/fs";
import { readContents } from "$scripts/ui/filedrop";
import {  VirtualSystem } from "./virtual";
import { showDirectoryPicker, type FileSystemDirectoryHandle, type FileSystemFileHandle } from "native-file-system-adapter";



export class RealSystem extends VirtualSystem {

    static isRealSystem(rfs: VirtualSystem): rfs is RealSystem  {
        return (rfs as RealSystem).fileHandle !== undefined;
    }

    static initialization = true;

    static currentMount: VirtualFile;
    fileHandle;

    constructor(fileHandle?: FileSystemHandle) {
        super();
        this.fileHandle = fileHandle;
    }

    createFile(file: RegFile): void {
        
    }

    createFolder(file: DirectoryFile): void {
        
    }

    remove(file: BaseFile): void {
        
    }
    
    static async #initiateDirectory(
        dir: FileSystemDirectoryHandle, 
        parent: VirtualDirectoryFile | null
    ): Promise<VirtualDirectoryFile> {
        // null parent means VDS root, in this case 
        // return the actual directory's parent
        const vdir = new VirtualDirectoryFile(dir.name, parent, new RealSystem(dir));
       
        for await (const item of dir.values()) {
            if (item.kind === "file") {
                const handle = item as FileSystemFileHandle;
                const contents = await readContents(await handle.getFile());
                new VirtualRegFile(handle.name, vdir, contents, new RealSystem(handle));
            }
            if (item.kind === "directory") {
                const handle = item as FileSystemDirectoryHandle;
                this.#initiateDirectory(handle, vdir);
            }
        }
        return vdir;
    }

    static async #navigate(dir: FileSystemDirectoryHandle, path: string[]) 
        : Promise<FileSystemDirectoryHandle> {
        if (path.length === 0) {
            throw new Error("Directory not found!");
        }
        for await (const item of dir.values()) {
            if (item.name != path[0]) {
                continue;
            }

            if (item.kind !== "directory") {
                throw new Error("Path contains a file!");
            }
            const realDir = item as FileSystemDirectoryHandle;
            if (path.length === 1) {
                return realDir;
            }
            
            return this.#navigate(realDir, path.slice(1));
        }
        throw new Error("Path is invalid!")
    }

    static async init(path: string) {
        RealSystem.initialization = true;
        let dir = await showDirectoryPicker();
        
        const splitted = path.split("/");
        if (path !== "") {
            dir = await this.#navigate(dir, splitted);
        }
        
        RealSystem.currentMount = await this.#initiateDirectory(dir, null);
        return new RealSystem(dir);
    }

    mount(file: BaseFile) {
        if (file.parent === null) {
            throw new Error("Can't mount root!");
        }
        const mountedFile = RealSystem.currentMount;


        if (RegFile.isRegFile(file)) {
            if (!RegFile.isRegFile(mountedFile)) {
                throw new Error("Mount file type mismatch!")
            }
            file.contents = mountedFile.contents;
        }

        if (DirectoryFile.isDirectory(file)) {
            if (!DirectoryFile.isDirectory(mountedFile)) {
                throw new Error("Mount file type mismatch!")
            }
            file.files = mountedFile.files;
        }

        file.name = mountedFile.name;
        RealSystem.initialization = false;
    }

}

