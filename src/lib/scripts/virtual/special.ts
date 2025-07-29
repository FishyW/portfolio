// definition of special files

import { IndexedDBSystem } from "./indexdb"

async function serializeFileSystem(){
    // reset
    const serialized = await IndexedDBSystem.serializeFromStore();
    return JSON.stringify(serialized, null, 2);
}

async function deserializeFileSystem(contents: string) {
    await IndexedDBSystem.deserializeToStore(JSON.parse(contents));
    window.location.reload();		
}

export const specGenMap: {[name: string]: 
    [typeof serializeFileSystem, typeof deserializeFileSystem]} = {
    "fs": [serializeFileSystem, deserializeFileSystem] 
}