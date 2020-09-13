import { Controller } from "../framework";

export interface Tree {
    setTreeOpenness?(isOpen: boolean): void;
    sortByComplexity(): void;
    sortInOrder(): void;
}

export class TreeController implements Controller<Tree> {
    private components = [] as Tree[];

    collapseAll() {
        for (const component of this.components) {
            if (component.setTreeOpenness) {
                component.setTreeOpenness(false);
            }
        }
    }

    expandAll() {
        for (const component of this.components) {
            if (component.setTreeOpenness) {
                component.setTreeOpenness(true);
            }
        }
    }

    sortByComplexity() {
        for (const component of this.components) {
            component.sortByComplexity();
        }
    }

    sortInOrder() {
        for (const component of this.components) {
            component.sortInOrder();
        }
    }

    register(component: Tree) {
        this.components.push(component);
    }

    unregister(component: Tree) {
        const pos = this.components.indexOf(component);
        this.components.splice(pos);
    }
}