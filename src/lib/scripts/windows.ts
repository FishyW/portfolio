// reexports of svelte components
// new windows are declared here

import type { Component } from "svelte";
import Files from "$components/WindowFile.svelte";
import ImageViewer  from "$components/WindowImageViewer.svelte";
import TextEditor  from "$components/WindowTextEditor.svelte";
import PDFViewer from "$components/WindowPDFViewer.svelte";
import Empty from "$components/dummy/WindowEmpty.svelte";

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
    icon: "",
    component: Files
};


export const ImageViewerInfo: WindowInfo = {
    name: "Image Viewer",
    icon: "",
    component: ImageViewer
};


 export const TextEditorInfo: WindowInfo = {
    name: "Text Editor",
    icon: "",
    component: TextEditor
};

export const DocumentViewerInfo: WindowInfo = {
    name: "Document Viewer",
    icon: "",
    component: PDFViewer
};


export const EmptyInfo: WindowInfo = {
    name: "Empty",
    icon: "",
    component: Empty
};