import { browser } from "$app/environment";
import { BaseFile, DirectoryFile, fileSystemInit, RegFile } from "./fs.svelte";
import { initializeStore } from "./store";
import { imageMimeMap } from "./config.svelte";

import workerURL from 'pdfjs-dist/build/pdf.worker.min.mjs?url';


import desktopImg from "$icons/files/Desktop.svg";
import documentImg from "$icons/files/Document.svg";
import downloadsImg from "$icons/files/Downloads.svg";
import fileImg from "$icons/files/File.svg";
import fileEncryptedImg from "$icons/files/FileEncrypt.svg";
import fileMountedImg from "$icons/files/FileEject.svg";
import folderImg from "$icons/files/Folder.svg";
import folderEncryptedImg from "$icons/files/FolderEncrypt.svg";
import folderMountedImg from "$icons/files/FolderEject.svg";
import githubDocImg from "$icons/files/GitHubDoc.svg";
import linkedinDocImg from "$icons/files/LinkedInDoc.svg";
import musicImg from "$icons/files/Music.svg";
import picturesImg from "$icons/files/Pictures.svg";
import shareImg from "$icons/files/Share.svg";
import creditsImg from "$icons/files/ThanksDoc.svg";
import videosImg from "$icons/files/Videos.svg";
import systemImg from "$icons/files/System.svg";


let PDFJS: typeof import("pdfjs-dist");
if (browser) {
    PDFJS = await import("pdfjs-dist");
    PDFJS.GlobalWorkerOptions.workerSrc = workerURL;
}
    

async function init() {
    if (browser) {
        await fileSystemInit();
        const storeItems = {
            pathMap: {
                "/home/Downloads":  downloadsImg,
                "/home/Desktop": desktopImg,
                "/home/Videos": videosImg,
                "/home/Documents": documentImg,
                "/home/Share": shareImg,
                "/home/Music": musicImg,
                "/home/Pictures": picturesImg,
                "/home/System": systemImg,
                "/home/Share/linkedin.com": linkedinDocImg,
                "/home/Share/github.com": githubDocImg,
                "/home/Share/credits.txt": creditsImg
            },
            extensionMap: {
                "enc": fileEncryptedImg,
                "encdir": folderEncryptedImg
            },
            mountedFile: fileMountedImg,
            mountedFolder: folderMountedImg,
            defaultFile: fileImg,
            defaultFolder: folderImg
        };
        return initializeStore("Icon Manager", storeItems);
    }
}

const store = (await init())!;

// we use the index since the index is guaranteed to be unique
// the path name is only unique at a single point in time
// this might "fail" though see below 
interface CacheItem {
    idx: number,
    url: string
};

let cache: CacheItem[] = [];

// we should probably clean after a while, but for now I won't
// function clean(currentFile: BaseFile) {
//     if (currentFile.parent === null) {
//         return;
//     }

//     cache
//         .filter(item => item.cwd !== fileSystem.cwd.path)
//         .forEach(item => URL.revokeObjectURL(item.url));

//     cache = cache
//         .filter(item => item.cwd === fileSystem.cwd.path);
// }

// this is a simple cache
// this cache will "fail" if the item is modified after use
// however, the good new is that the cache is only used for PDFs and Images
// which cannot be modified by the file system (yet)
function checkCache(file: BaseFile) {
    const item = cache.find(item => item.idx === file.idx)
    return item?.url;
}



function getIcon(file: BaseFile): string {

    const icons = store.read();
    
    // first check the path map
    if (file.path in icons.pathMap)  {
        return (icons.pathMap as any)[file.path];
    }

    if (!RegFile.isRegFile(file)) {
        return DirectoryFile.isDirectory(file) ? 
            icons.defaultFolder : icons.defaultFile; 
    }

    const extension = file.getExtension() ?? "";
    if (extension in icons.extensionMap) {
        return (icons.extensionMap as any)[extension];
    }

    if (extension in imageMimeMap) {

        let url = checkCache(file);
        if (url !== undefined) {
            return url;
        }

        const mime = imageMimeMap[extension];
        url  = URL.createObjectURL(file.intoFile(mime));
        cache.push({
            idx: file.idx,
            url
        });
        return url;
    }
    
    return icons.defaultFile; 
}

const SCALE = 1.5;

async function intoBlob(contents: ArrayBuffer) {
    // copy array buffer
    const copy = new ArrayBuffer(contents.byteLength);
    new Uint8Array(copy).set(new Uint8Array(contents));

    const doc = await PDFJS.getDocument(copy).promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: SCALE });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({canvasContext: context, viewport }).promise;
    const imageBlob: Blob | null = await new Promise((res, rej) => canvas.toBlob(res));
    if (imageBlob === null) {
        throw new Error("Unable to convert to blob!");
    }
    return imageBlob;
}

export async function getIconAsync(file: BaseFile) {
    const icons = store.read();

    if (file.isBaseMount) {
        return DirectoryFile.isDirectory(file) ? 
            icons.mountedFolder : icons.mountedFile;
    }
    
    if (file.getExtension() !== "pdf") {
        return getIcon(file);
    }
    if (!RegFile.isRegFile(file) || typeof(file.contents) === "string") {
        return DirectoryFile.isDirectory(file) ? 
            icons.defaultFolder : icons.defaultFile; 
    }
    try {
        let url = checkCache(file);
        if (url !== undefined) {
            return url;
        }
            
        const imageBlob = await intoBlob(file.contents);
        url = URL.createObjectURL(imageBlob);
        cache.push({
            idx: file.idx,
            url
        });
        return url;
        
    } catch(e) {
        console.error(e);
        return icons.defaultFile;
    }
    
    
}