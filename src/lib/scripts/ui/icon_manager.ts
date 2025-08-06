import { browser } from "$app/environment";
import { BaseFile, DirectoryFile, fileSystemInit } from "./fs.svelte";
import { initializeStore } from "./store";

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
                "/home/System": folderImg,
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


export function getIcon(file: BaseFile) {
    const icons = store.read();

    if (file.isBaseMount) {
        return DirectoryFile.isDirectory(file) ? 
            icons.mountedFolder : icons.mountedFile;
    }

    // first check the path map
    if (file.path in icons.pathMap)  {
        return (icons.pathMap as any)[file.path];
    }

    const extension = file.getExtension() ?? "";
    if (extension in icons.extensionMap) {
        return (icons.extensionMap as any)[extension];
    }
    
    return DirectoryFile.isDirectory(file) ? 
            icons.defaultFolder : icons.defaultFile; 
}


