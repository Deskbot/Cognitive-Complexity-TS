import { Controller } from "../framework";

export interface Tree {
    setTreeOpenness(isOpen: boolean): void;
}

export class TreeController implements Controller<Tree> {
    private components = [] as Tree[];

    collapseAll() {
        for (const component of this.components) {
            component.setTreeOpenness(false);
        }
    }

    expandAll() {
        for (const component of this.components) {
            component.setTreeOpenness(true);
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