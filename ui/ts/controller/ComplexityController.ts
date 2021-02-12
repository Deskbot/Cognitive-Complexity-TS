import { ProgramOutput } from "../../../shared/types.js";
import { cloneSortedOutput, convertToSortedOutput, isSortedContainerOutput, isSortedFolderOutput, SortedAnything, SortedProgramOutput, sortProgramByComplexity, sortProgramByName, sortProgramInOrder } from "../domain/sortedOutput.js";
import { removeAll } from "../util/util.js";
import { Tree } from "../component/tree/Tree.js";
import { ComplexityModel } from "../model/ComplexityModel.js";

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
    private model: ComplexityModel;
    private view: Tree;

    private complexity: SortedProgramOutput;
    private initialComplexity: SortedProgramOutput;

    private include = Include.folders;
    private sortMethod = Sort.inOrder;

    constructor(progComp: ProgramOutput, model: ComplexityModel, view: Tree) {
        this.model = model;
        this.view = view;

        this.complexity = convertToSortedOutput(progComp);
        this.initialComplexity = cloneSortedOutput(this.complexity);

        // post-construct

        this.sortInOrder();
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
        this.model.changeComplexity(this.complexity);
    }

    sortInOrder() {
        this.sortMethod = Sort.inOrder;
        this.sort();
        this.model.changeComplexity(this.complexity);
    }

    // filter

    private filter() {
        this.complexity = cloneSortedOutput(this.initialComplexity);

        const removeWhat: (data: SortedAnything) => boolean
            = this.include === Include.folders
                ? () => false
                : this.include === Include.files
                    ? data => isSortedFolderOutput(data)
                    : data => !isSortedContainerOutput(data)

        this.removeComplexityNodes(this.complexity.inner, removeWhat);

        this.sort();

        this.view.makeTree(this.complexity);
        this.model.changeComplexity(this.complexity);
    }

    private removeComplexityNodes(inner: SortedAnything[], removeWhat: (data: SortedAnything) => boolean) {
        const removed = removeAll(inner, removeWhat);

        if (removed.length > 0) {
            // move nodes from inner of removed element to the parent element's inner

            // add inners of children items to parent inner
            inner.push(...removed.flatMap(removedElem => removedElem.inner));

            // remove those same items from the inner of the children
            removed.forEach(removedElem => removedElem.inner.splice(0));

            // now there are more nodes in the parent inner, consider filtering it again
            this.removeComplexityNodes(inner, removeWhat);
        }
    }

    setInclude(include: Include) {
        this.include = include;
        this.filter();
    }
}
