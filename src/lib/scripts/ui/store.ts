// storage utilities built on top of my file system API
import { DirectoryFile, fileSystem, RegFile } from "./fs.svelte";

function getStore(appId: string) {
    let storeFile = fileSystem.findFile(`/home/System/store/${appId}.json`);
    if (storeFile !== null && !RegFile.isRegFile(storeFile)) {
        throw new Error("Store file found but is not a regular file!");
    }
    return storeFile;
}
 
// creates a new store overriding the previous store
function createStore(appId: string) {
    const systemFolder = fileSystem.findFile("/home/System")! as DirectoryFile;
    let storeFolder = systemFolder.getFile("store");
    if (storeFolder === null) {
        storeFolder = systemFolder.createFolder("store");
    }
    if (!DirectoryFile.isDirectory(storeFolder)) {
        throw new Error("Store folder found but is not a directory!");
    }
    if (storeFolder.hasFile(appId)) {
        storeFolder.remove(appId);
    }

    return storeFolder.createFile(`${appId}.json`, "");
}


// creates a store file and initializes it with the object
// if it exists do nothing
export function initializeStore<T>(appId: string, object: T) {

    let storeFile = getStore(appId);
    if (storeFile !== null) {
        return new Store<T>(storeFile);
    }    

    storeFile = createStore(appId);
    storeFile.contents = JSON.stringify(object, null, 2);
    return new Store<T>(storeFile);
}

class Store<T> {
    file;

    constructor(file: RegFile) {
        this.file = file;
    }

    read(): T {
        return JSON.parse(this.file.contents as string);
    }

    write(object: T) {
        this.file.contents = JSON.stringify(object, null, 2);
    }

    remove() {
        this.file.removeSelf();
    }
}

