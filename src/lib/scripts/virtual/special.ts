// definition of special files

import type { SpecialFile } from "$scripts/fs";
import { openTxt } from "$scripts/ui/config.svelte";
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

async function notImplemented(...args: any[]): Promise<never> {
    throw new Error("Not implemented!");
}

type SpecMap = {[name: string]: 
    [(file: SpecialFile) => void, () => Promise<string>, (contents: string) => void, ]} 

export const specGenMap: SpecMap = {
    "fs": [openTxt, serializeFileSystem, deserializeFileSystem]
}