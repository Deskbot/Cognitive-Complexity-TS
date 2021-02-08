import { Controller } from "../framework.js";

export interface Tree {
    setOpenness(isOpen: boolean): void;
}

export class TreeController implements Controller<Tree> {
    private components = [] as Tree[];

    collapseAll() {
        this.setTreeOpenness(false);
    }

    expandAll() {
        this.setTreeOpenness(true);
    }

    private setTreeOpenness(isOpen: boolean) {
        for (const component of this.components) {
            component.setOpenness(isOpen);
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