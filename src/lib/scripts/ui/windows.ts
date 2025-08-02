// reexports of svelte components
// new windows are declared here

import type { Component } from "svelte";
import Files from "$components/WindowFile.svelte";
import ImageViewer  from "$components/WindowImageViewer.svelte";
import TextEditor  from "$components/WindowTextEditor.svelte";
import PDFViewer from "$components/WindowPDFViewer.svelte";
import Empty from "$components/dummy/WindowEmpty.svelte";

import filesImg from "$icons/dash/file_manager.svg";
import textEditorImg from "$icons/dash/textedit.svg";
import pdfViewerImg from "$icons/dash/pdf.svg";

// name must be unique
// all windows need to have this 
// and they need to register the window details at the start
export interface WindowInfo {
    name: string,
    icon: string,
    component: Component<any>
}

export const FilesInfo: WindowInfo = {
    name: "Files",
    icon: filesImg,
    component: Files
};


export const ImageViewerInfo: WindowInfo = {
    name: "Image Viewer",
    icon: "",
    component: ImageViewer
};


 export const TextEditorInfo: WindowInfo = {
    name: "Text Editor",
    icon: textEditorImg,
    component: TextEditor
};

export const DocumentViewerInfo: WindowInfo = {
    name: "Document Viewer",
    icon: pdfViewerImg,
    component: PDFViewer
};


export const EmptyInfo: WindowInfo = {
    name: "Empty",
    icon: "",
    component: Empty
};