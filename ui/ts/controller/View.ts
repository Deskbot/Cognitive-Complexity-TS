import { Container } from "../component/tree/Container.js";
import { File } from "../component/tree/File.js";
import { Folder } from "../component/tree/Folder.js";
import { FolderContents } from "../component/tree/FolderContents.js";
import { isSortedFileOutput, SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput } from "../domain/sortedOutput.js";
import { element } from "../framework.js";

export class View {
    readonly dom: Element;

    private containerMap: Map<SortedContainerOutput, Container> = new Map();
    private folderMap: Map<SortedFolderOutput, Folder> = new Map();
    private fileMap: Map<SortedFileOutput, File> = new Map();
    private folderContentsMap: Map<SortedFolderOutput, FolderContents> = new Map();

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
        if (this.containerMap.has(containerOutput)) {
            return this.containerMap.get(containerOutput)!;
        }

        const container = new Container(containerOutput, containerOutput.path, containerOutput.inner.map(inner => this.makeContainer(inner)));
        this.containerMap.set(containerOutput, container);
        return container;
    }

    private makeFile(fileOutput: SortedFileOutput): File {
        if (this.fileMap.has(fileOutput)) {
            return this.fileMap.get(fileOutput)!;
        }

        const children = [] as Container[];

        for (const containerOutput of fileOutput.inner) {
            children.push(this.makeContainer(containerOutput));
        }

        const file = new File(fileOutput.path, fileOutput.name, fileOutput.score, children);

        this.fileMap.set(fileOutput, file);

        return file;
    }

    private makeFolderContents(folderOutput: SortedFolderOutput): FolderContents {
        if (this.folderContentsMap.has(folderOutput)) {
            return this.folderContentsMap.get(folderOutput)!;
        }

        const folderContents = new FolderContents(folderOutput.inner.map((folderEntry) => {
            const folderEntryComponent = isSortedFileOutput(folderEntry)
                ? this.makeFile(folderEntry)
                : this.makeFolder(folderEntry);

            return folderEntryComponent;
        }));

        this.folderContentsMap.set(folderOutput, folderContents);

        return folderContents;
    }

    private makeFolder(folderOutput: SortedFolderOutput): Folder {
        if (this.folderMap.has(folderOutput)) {
            return this.folderMap.get(folderOutput)!;
        }

        const folder = new Folder(folderOutput.path, folderOutput.name, this.makeFolderContents(folderOutput));
        this.folderMap.set(folderOutput, folder);
        return folder;
    }

    // changes

    reChild() {
        // folder contents
        for (const [complexity, folderContents] of this.folderContentsMap) {
            folderContents.setChildren(complexity.inner.map((folderEntry) => {
                const folderEntryComponent = isSortedFileOutput(folderEntry)
                    ? this.makeFile(folderEntry)
                    : this.makeFolder(folderEntry);

                return folderEntryComponent;
            }));
        }

        // files
        for (const [complexity, file] of this.fileMap) {
            file.setChildren(complexity.inner.map(containerOutput => this.makeContainer(containerOutput)));
        }

        // containers
        for (const [complexity, container] of this.containerMap) {
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