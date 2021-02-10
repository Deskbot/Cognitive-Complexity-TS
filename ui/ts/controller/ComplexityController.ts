import { ProgramOutput } from "../../../shared/types.js";
import { cloneSortedOutput, convertToSortedOutput, isSortedContainerOutput, isSortedFileOutput, SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput, sortProgramByComplexity, sortProgramInOrder } from "../domain/sortedOutput.js";
import { removeAll } from "../util/util.js";
import { TreeView } from "../component/tree/TreeView.js";

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
    private view: TreeView;

    private complexity: SortedProgramOutput;
    private initialComplexity: SortedProgramOutput;

    private include = Include.folders;
    private sortMethod = Sort.inOrder;

    constructor(progComp: ProgramOutput, view: TreeView) {
        this.view = view;

        this.complexity = convertToSortedOutput(progComp);
        this.initialComplexity = cloneSortedOutput(this.complexity);
        sortProgramInOrder(this.complexity);

        this.view.makeTree(this.complexity);
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
            sortProgramInOrder(this.complexity);
        } else if (this.sortMethod === Sort.complexity) {
            sortProgramByComplexity(this.complexity);
        }

        this.view.reChild();
    }

    sortByComplexity() {
        this.sortMethod = Sort.complexity;
        this.sort();
    }

    sortInOrder() {
        this.sortMethod = Sort.inOrder;
        this.sort();
    }

    // filter

    private filter() {
        this.complexity = cloneSortedOutput(this.initialComplexity);
        this.sort();

        const removeWhat: (data: SortedFolderOutput | SortedFileOutput | SortedContainerOutput) => boolean
            = this.include === Include.folders
                ? () => false
                : this.include === Include.files
                    ? data => !isSortedContainerOutput(data) && !isSortedFileOutput(data)
                    : data => !isSortedContainerOutput(data)

        this.removeComplexityNodes(this.complexity.inner, removeWhat);

        this.view.makeTree(this.complexity);
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
