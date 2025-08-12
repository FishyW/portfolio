// Several Extension Managers
// When opening a file, the function in the map is called
import { RegFile } from "./fs.svelte";
import { open } from "$components/WindowManager.svelte";
import { DocumentViewerInfo, ImageViewerInfo, TextEditorInfo } from "./info";
import { VirtualSystem } from "$scripts/virtual/virtual";
import { IndexedDBSystem } from "$scripts/virtual/indexdb";
import { LoggerSystem } from "$scripts/virtual/logger";
import { EphemeralSystem } from "$scripts/virtual/ephemeral";
import type { SpecialFile } from "$scripts/fs";
import { decryptFile, select } from "$scripts/ui/operations.svelte";

export function openTxt(file: RegFile | SpecialFile) {
    open(TextEditorInfo, { file } );
}

function openPDF(file: RegFile) {
    open(DocumentViewerInfo, { file });
}

function openImage(file: RegFile) {
    open(ImageViewerInfo, { file });
}

function openURL(file: RegFile) {
    if (typeof(file.contents) !== "string") {
        throw new Error("File contents is not a string!");
    } 
    window.open(file.contents, "_blank");
}

function decrypt(file: RegFile) {
    select(file);
    decryptFile();
}

export const imageMimeMap: { [name: string]: string } = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "jfif": "image/jpeg",
    "pjpeg": "image/jpeg",
    "pjp": "image/jpeg",
    "gif": "image/gif",
    "avif": "image/avif",
    "apng": "image/apng",
    "svg": "image/svg+xml",
    "webp": "image/webp",
    "png": "image/png"
};

const imageExtMap = Object.fromEntries(
    Object.keys(imageMimeMap)
        .map(ext => [ext, openImage]))


const extMap = {
    "txt": openTxt,
    "pdf": openPDF,
    "com": openURL,
    "enc": decrypt,
    "encdir": decrypt,
    ...imageExtMap
};

// IndexedDB is not here since it's technically not a virtual file system
export const VFSMap: {[name: string]: typeof VirtualSystem} = {
    // "file": RealSystem,
    "ephemeral": EphemeralSystem,
    "logger": LoggerSystem
};

export const extensionMap = new Map(Object.entries(extMap));
// export const specialFilesMap = new Map(Object.entries());

export const defaultAction = openTxt;
export const MainFS = IndexedDBSystem;

