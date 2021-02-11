import { Container } from "./Container.js";
import { File } from "./File.js";
import { Folder } from "./Folder.js";
import { FolderContents } from "./FolderContents.js";
import { isSortedFileOutput, SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput } from "../../domain/sortedOutput.js";
import { element } from "../../framework.js";

export class TreeView {
    readonly dom: Element;

    private containerMap = new Map<number, Container>();
    private folderMap = new Map<number, Folder>();
    private fileMap = new Map<number, File>();
    private folderContentsMap = new Map<number, FolderContents>();

    private containerComplexityMap = new Map<number, SortedContainerOutput>();
    private folderComplexityMap = new Map<number, SortedFolderOutput>();
    private fileComplexityMap = new Map<number, SortedFileOutput>();
    private folderContentsComplexityMap = new Map<number, SortedFolderOutput>();

    constructor() {
        this.dom = element("div");
    }

    // make

    makeTree(complexity: SortedProgramOutput) {
        const contents = this.makeFolderContents(complexity);

        // If there is only one top level node, show it expanded.
        // Otherwise show all nodes minimised by default.
        const onlyOneTopLevelNode = complexity.inner.length <= 1;

        if (onlyOneTopLevelNode) {
            contents.setOpenness(true);
        }

        this.dom.innerHTML = "";
        this.dom.appendChild(contents.dom);
    }

    private makeContainer(containerOutput: SortedContainerOutput): Container {
        if (this.containerMap.has(containerOutput.id)) {
            return this.containerMap.get(containerOutput.id)!;
        }

        const container = new Container(containerOutput, containerOutput.path, containerOutput.inner.map(inner => this.makeContainer(inner)));

        this.containerMap.set(containerOutput.id, container);
        this.containerComplexityMap.set(containerOutput.id, containerOutput);

        return container;
    }

    private makeFile(fileOutput: SortedFileOutput): File {
        if (this.fileMap.has(fileOutput.id)) {
            return this.fileMap.get(fileOutput.id)!;
        }

        const children = [] as Container[];

        for (const containerOutput of fileOutput.inner) {
            children.push(this.makeContainer(containerOutput));
        }

        const file = new File(fileOutput.path, fileOutput.name, fileOutput.score, children);

        this.fileMap.set(fileOutput.id, file);
        this.fileComplexityMap.set(fileOutput.id, fileOutput);

        return file;
    }

    private makeFolderContents(folderOutput: SortedFolderOutput): FolderContents {
        if (this.folderContentsMap.has(folderOutput.id)) {
            return this.folderContentsMap.get(folderOutput.id)!;
        }

        const folderContents = new FolderContents(folderOutput.inner.map((folderEntry) => {
            const folderEntryComponent = isSortedFileOutput(folderEntry)
                ? this.makeFile(folderEntry)
                : this.makeFolder(folderEntry);

            return folderEntryComponent;
        }));

        this.folderContentsMap.set(folderOutput.id, folderContents);
        this.folderContentsComplexityMap.set(folderOutput.id, folderOutput);

        return folderContents;
    }

    private makeFolder(folderOutput: SortedFolderOutput): Folder {
        if (this.folderMap.has(folderOutput.id)) {
            return this.folderMap.get(folderOutput.id)!;
        }

        const folder = new Folder(folderOutput.path, folderOutput.name, this.makeFolderContents(folderOutput));

        this.folderMap.set(folderOutput.id, folder);
        this.folderComplexityMap.set(folderOutput.id, folderOutput);

        return folder;
    }

    // changes

    reChild() {
        // folder contents
        for (const [complexityId, folderContents] of this.folderContentsMap) {
            const complexity = this.folderContentsComplexityMap.get(complexityId)!;

            folderContents.setChildren(complexity.inner.map((folderEntry) => {
                const folderEntryComponent = isSortedFileOutput(folderEntry)
                    ? this.makeFile(folderEntry)
                    : this.makeFolder(folderEntry);

                return folderEntryComponent;
            }));
        }

        // files
        for (const [complexityId, file] of this.fileMap) {
            const complexity = this.fileComplexityMap.get(complexityId)!;

            file.setChildren(complexity.inner.map(containerOutput => this.makeContainer(containerOutput)));
        }

        // containers
        for (const [complexityId, container] of this.containerMap) {
            const complexity = this.containerComplexityMap.get(complexityId)!;

            container.setChildren(complexity.inner.map(containerOutput => this.makeContainer(containerOutput)));
        }
    }

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