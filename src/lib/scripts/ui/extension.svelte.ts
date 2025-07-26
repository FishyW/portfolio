// Several Extension Managers
// When opening a file, the function in the map is called
import { RegFile } from "../fs.svelte";
import { open } from "$components/WindowManager.svelte";
import { DocumentViewerInfo, ImageViewerInfo, TextEditorInfo } from "./windows";


function openTxt(file: RegFile) {
    open(TextEditorInfo, { file } );
}

function openPDF(file: RegFile) {
    open(DocumentViewerInfo, { file });
}

function openImage(file: RegFile) {
    open(ImageViewerInfo, { file });
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
    ...imageExtMap
};

export const extensionMap = new Map(Object.entries(extMap));
export const defaultAction = openTxt;