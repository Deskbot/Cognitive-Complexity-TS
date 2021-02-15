import { ProgramOutput } from "../../../shared/types.js";
import { cloneSortedOutput, convertToSortedOutput, isSortedContainerOutput, isSortedFileOutput, isSortedFolderOutput, SortedAnything, SortedProgram, sortProgramByComplexity, sortProgramByName, sortProgramInOrder } from "../domain/sortedOutput.js";
import { removeAll } from "../util.js";
import { Tree } from "../component/tree/Tree.js";
import { ComplexityModel } from "./ComplexityModel.js";

export enum Include {
    folders = 1,
    files,
    containers,
}

export enum Sort {
    inOrder = 1,
    complexity,
}

/**
 * Responsible for enacting UI changes to the complexity tree.
 * It does this by changing the tree representation and saving it in the model.
 */
export class ComplexityController {
    private model: ComplexityModel;
    private view: Tree;

    private complexity: SortedProgram;
    private initialComplexity: SortedProgram;

    private include = Include.folders;
    private sortMethod = Sort.inOrder;

    constructor(progComp: ProgramOutput, model: ComplexityModel, view: Tree) {
        this.model = model;
        this.view = view;

        this.complexity = convertToSortedOutput(progComp);
        this.initialComplexity = cloneSortedOutput(this.complexity);

        // post-construct

        this.sort();
        this.model.overwriteComplexity(this.complexity);
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
        console.log("sort");

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

    setSortBy(method: Sort) {
        this.sortMethod = method;
        this.sort();
        this.model.overwriteComplexity(this.complexity);
    }

    // filter

    private filter() {
        console.log("filter");

        this.complexity = cloneSortedOutput(this.initialComplexity);

        const removeWhat: (data: SortedAnything) => boolean
            = this.include === Include.folders
                ? () => false
                : this.include === Include.files
                    ? data => isSortedFolderOutput(data)
                    : data => !isSortedContainerOutput(data)

        this.moveComplexityNodes(this.complexity.inner, removeWhat);

        this.reDepth();
        this.sort();

        this.model.overwriteComplexity(this.complexity);
    }

    private moveComplexityNodes(inner: SortedAnything[], removeWhat: (data: SortedAnything) => boolean) {
        const removed = removeAll(inner, removeWhat);

        if (removed.length > 0) {
            // move nodes from inner of removed element to the parent element's inner

            // add inners of children items to parent inner
            inner.push(...removed.flatMap(removedElem => removedElem.inner));

            // remove those same items from the inner of the children
            for (const removedElem of removed) {
                removedElem.inner.splice(0);

                // update these elements here because they are removed from the tree and won't be updated when the tree is overwritten
                if (isSortedFolderOutput(removedElem)) {
                    this.model.updateFolder(removedElem);
                } else if (isSortedFileOutput(removedElem)) {
                    this.model.updateFile(removedElem);
                } else if (isSortedContainerOutput(removedElem)) {
                    this.model.updateContainer(removedElem);
                }
            }

            // now there are more nodes in the parent inner, consider filtering it again
            this.moveComplexityNodes(inner, removeWhat);
        }
    }

    private reDepth(complexity = this.complexity, depth = 0) {
        complexity.depth = depth;
        complexity.inner.forEach(child => this.reDepth(child, depth + 1));
    }

    setInclude(include: Include) {
        this.include = include;
        this.filter();
    }
}
