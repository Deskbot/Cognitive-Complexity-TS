import { Container } from "./Container.js";
import { File } from "./File.js";
import { Folder } from "./Folder.js";
import { FolderContents } from "./FolderContents.js";
import { isSortedContainerOutput, isSortedFileOutput, SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput } from "../../domain/sortedOutput.js";
import { element, Store } from "../../framework.js";

export class Tree {
    readonly dom: Element;

    private containerMap = new Map<number, Container>();
    private folderMap = new Map<number, Folder>();
    private fileMap = new Map<number, File>();
    private folderContentsMap = new Map<number, FolderContents>();

    private containerComplexityMap = new Store<SortedContainerOutput>();
    private fileComplexityMap = new Store<SortedFileOutput>();
    private folderContentsComplexityMap = new Store<SortedFolderOutput>();

    constructor() {
        this.dom = element("div");
    }

    // change complexity

    changeComplexity(complexity: SortedProgramOutput) {
        this.changeFolderContents(complexity);
    }

    private changeContainer(containerOutput: SortedContainerOutput): Container {
        const observableContainer = this.containerComplexityMap.set(containerOutput);
        observableContainer.onChange(newContainer => this.reChildContainer(newContainer));

        if (this.containerMap.has(containerOutput.id)) {
            return this.containerMap.get(containerOutput.id)!;
        } else {
            console.log("container");
        }

        const container = new Container(containerOutput, containerOutput.path, containerOutput.inner.map(inner => this.makeContainer(inner)));

        this.containerMap.set(containerOutput.id, container);

        return container;
    }

    private changeFile(fileOutput: SortedFileOutput) {
        const observableFile = this.fileComplexityMap.set(fileOutput);
        observableFile.onChange(newFile => this.reChildFile(newFile));

        for (const containerOutput of fileOutput.inner) {
            this.changeContainer(containerOutput);
        }
    }

    private changeFolderContents(folderOutput: SortedFolderOutput) {
        const observableFolderContents = this.folderContentsComplexityMap.set(folderOutput);
        observableFolderContents.onChange(newFolder => this.reChildFolderContents(newFolder));

        folderOutput.inner.forEach((folderEntry) => {
            isSortedContainerOutput(folderEntry)
                ? this.changeContainer(folderEntry)
                : isSortedFileOutput(folderEntry)
                    ? this.changeFile(folderEntry)
                    : this.changeFolder(folderEntry);
        });
    }

    private changeFolder(folderOutput: SortedFolderOutput) {
        this.changeFolderContents(folderOutput)
    }

    // make

    makeTree(complexity: SortedProgramOutput, initial = false) {
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

    private makeContainer(containerOutput: SortedContainerOutput): Container {
        const observableContainer = this.containerComplexityMap.set(containerOutput);
        observableContainer.onChange(newContainer => this.reChildContainer(newContainer));

        if (this.containerMap.has(containerOutput.id)) {
            return this.containerMap.get(containerOutput.id)!;
        } else {
            console.log("container");
        }

        const container = new Container(containerOutput, containerOutput.path, containerOutput.inner.map(inner => this.makeContainer(inner)));

        this.containerMap.set(containerOutput.id, container);

        return container;
    }

    private makeFile(fileOutput: SortedFileOutput): File {
        const observableFile = this.fileComplexityMap.set(fileOutput);
        observableFile.onChange(newFile => this.reChildFile(newFile));

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

    private makeFolderContents(folderOutput: SortedFolderOutput): FolderContents {
        const observableFolderContents = this.folderContentsComplexityMap.set(folderOutput);
        observableFolderContents.onChange(newFolder => this.reChildFolderContents(newFolder));

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

    private makeFolder(folderOutput: SortedFolderOutput): Folder {
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

    reChildFolderContents(complexity: SortedFolderOutput) {
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

    reChildFile(complexity: SortedFileOutput) {
        const file = this.fileMap.get(complexity.id)!;
        file.setChildren(complexity.inner.map(containerOutput => this.makeContainer(containerOutput)));
    }

    reChildContainer(complexity: SortedContainerOutput) {
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