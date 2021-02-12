import { Container } from "./Container.js";
import { File } from "./File.js";
import { Folder } from "./Folder.js";
import { FolderContents } from "./FolderContents.js";
import { isSortedContainerOutput, isSortedFileOutput, SortedContainer, SortedFile, SortedFolder, SortedProgram } from "../../domain/sortedOutput.js";
import { element, Store } from "../../framework.js";

export class Tree {
    readonly dom: Element;

    private containerMap = new Map<number, Container>();
    private folderMap = new Map<number, Folder>();
    private fileMap = new Map<number, File>();
    private folderContentsMap = new Map<number, FolderContents>();

    constructor() {
        this.dom = element("div");
    }

    // make

    makeTree(complexity: SortedProgram, initial = false) {
        const contents = this.makeFolderContents(complexity);

        if (initial) {
            // If there is only one top level node, show it expanded.
            // Otherwise show all nodes minimised by default.
            const onlyOneTopLevelNode = complexity.inner.length === 1;

            if (onlyOneTopLevelNode) {
                contents.setOpenness(true);
            }
        }

        this.dom.innerHTML = "";
        this.dom.appendChild(contents.dom);
    }

    private makeContainer(containerOutput: SortedContainer): Container {
        if (this.containerMap.has(containerOutput.id)) {
            return this.containerMap.get(containerOutput.id)!;
        } else {
            console.log("container");
        }

        const container = new Container(containerOutput, containerOutput.path, containerOutput.inner.map(inner => this.makeContainer(inner)));

        this.containerMap.set(containerOutput.id, container);

        return container;
    }

    private makeFile(fileOutput: SortedFile): File {
        if (this.fileMap.has(fileOutput.id)) {
            return this.fileMap.get(fileOutput.id)!;
        } else {
            console.log("file");
        }

        const children = [] as Container[];

        for (const containerOutput of fileOutput.inner) {
            children.push(this.makeContainer(containerOutput));
        }

        const file = new File(fileOutput.path, fileOutput.name, fileOutput.score, children);

        this.fileMap.set(fileOutput.id, file);

        return file;
    }

    private makeFolderContents(folderOutput: SortedFolder): FolderContents {
        if (this.folderContentsMap.has(folderOutput.id)) {
            return this.folderContentsMap.get(folderOutput.id)!;
        } else {
            console.log("folder contents");
        }

        const folderContents = new FolderContents(folderOutput.inner.map((folderEntry) => {
            const folderEntryComponent = isSortedContainerOutput(folderEntry)
                ? this.makeContainer(folderEntry)
                : isSortedFileOutput(folderEntry)
                    ? this.makeFile(folderEntry)
                    : this.makeFolder(folderEntry);

            return folderEntryComponent;
        }));

        this.folderContentsMap.set(folderOutput.id, folderContents);

        return folderContents;
    }

    private makeFolder(folderOutput: SortedFolder): Folder {
        if (this.folderMap.has(folderOutput.id)) {
            return this.folderMap.get(folderOutput.id)!;
        } else {
            console.log("folder");
        }

        const folder = new Folder(folderOutput.path, folderOutput.name, this.makeFolderContents(folderOutput));

        this.folderMap.set(folderOutput.id, folder);

        return folder;
    }

    // sorting

    reChildFolderContents(complexity: SortedFolder) {
        const folderContents = this.folderContentsMap.get(complexity.id)!;

        folderContents.setChildren(complexity.inner.map((folderEntry) => {
            const folderEntryComponent = isSortedContainerOutput(folderEntry)
                ? this.makeContainer(folderEntry)
                : isSortedFileOutput(folderEntry)
                    ? this.makeFile(folderEntry)
                    : this.makeFolder(folderEntry);

            return folderEntryComponent;
        }));
    }

    reChildFile(complexity: SortedFile) {
        const file = this.fileMap.get(complexity.id)!;
        file.setChildren(complexity.inner.map(containerOutput => this.makeContainer(containerOutput)));
    }

    reChildContainer(complexity: SortedContainer) {
        const containers = this.containerMap.get(complexity.id)!;
        containers.setChildren(complexity.inner.map(containerOutput => this.makeContainer(containerOutput)));
    }

    // collapse & expand

    collapseAll() {
        this.setTreeOpenness(false);
    }

    expandAll() {
        this.setTreeOpenness(true);
    }

    private setTreeOpenness(isOpen: boolean) {
        for (const component of this.containerMap.values()) {
            component.setOpenness(isOpen);
        }
        for (const component of this.folderMap.values()) {
            component.setOpenness(isOpen);
        }
        for (const component of this.fileMap.values()) {
            component.setOpenness(isOpen);
        }
        for (const component of this.folderContentsMap.values()) {
            component.setOpenness(isOpen);
        }
    }
}