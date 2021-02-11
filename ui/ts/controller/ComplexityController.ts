import { ProgramOutput } from "../../../shared/types.js";
import { cloneSortedOutput, convertToSortedOutput, isSortedContainerOutput, isSortedFolderOutput, SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput, sortProgramByComplexity, sortProgramByName, sortProgramInOrder } from "../domain/sortedOutput.js";
import { removeAll } from "../util/util.js";
import { Tree } from "../component/tree/Tree.js";

export enum Include {
    folders = 1,
    files,
    containers,
}

enum Sort {
    inOrder = 1,
    complexity,
}

export class ComplexityController {
    private view: Tree;

    private complexity: SortedProgramOutput;
    private initialComplexity: SortedProgramOutput;

    private include = Include.folders;
    private sortMethod = Sort.inOrder;

    constructor(progComp: ProgramOutput, view: Tree) {
        this.view = view;

        this.complexity = convertToSortedOutput(progComp);
        this.initialComplexity = cloneSortedOutput(this.complexity);
        sortProgramInOrder(this.complexity);

        this.view.makeTree(this.complexity, true);
    }

    // expand & collapse

    collapseAll() {
        this.view.collapseAll();
    }

    expandAll() {
        this.view.expandAll();
    }

    // sort

    private sort() {
        if (this.sortMethod === Sort.inOrder) {
            if (this.include === Include.containers) {
                // don't consider relative line numbers of containers
                sortProgramByName(this.complexity);
            } else {
                // consider relative line numbers of containers
                sortProgramInOrder(this.complexity);
            }

        } else if (this.sortMethod === Sort.complexity) {
            sortProgramByComplexity(this.complexity);
        }
    }

    sortByComplexity() {
        this.sortMethod = Sort.complexity;
        this.sort();
        this.view.changeComplexity(this.complexity);
    }

    sortInOrder() {
        this.sortMethod = Sort.inOrder;
        this.sort();
        this.view.changeComplexity(this.complexity);
    }

    // filter

    private filter() {
        this.complexity = cloneSortedOutput(this.initialComplexity);

        const removeWhat: (data: SortedFolderOutput | SortedFileOutput | SortedContainerOutput) => boolean
            = this.include === Include.folders
                ? () => false
                : this.include === Include.files
                    ? data => isSortedFolderOutput(data)
                    : data => !isSortedContainerOutput(data)

        this.removeComplexityNodes(this.complexity.inner, removeWhat);

        this.sort();

        this.view.makeTree(this.complexity);
        this.view.changeComplexity(this.complexity);
    }

    private removeComplexityNodes(inner: (SortedFolderOutput | SortedFileOutput | SortedContainerOutput)[], removeWhat: (data: SortedFolderOutput | SortedFileOutput | SortedContainerOutput) => boolean) {
        const removed = removeAll(inner, removeWhat);

        if (removed.length > 0) {
            inner.push(...removed.flatMap(removedElem => removedElem.inner));
            this.removeComplexityNodes(inner, removeWhat);
        }
    }

    setInclude(include: Include) {
        this.include = include;
        this.filter();
    }
}
