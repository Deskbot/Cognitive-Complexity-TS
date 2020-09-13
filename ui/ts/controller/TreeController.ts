export interface TreeControllable {
    setTreeOpenness(isOpen: boolean): void;
}

export class TreeController {
    private components = [] as TreeControllable[];

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

    register(component: TreeControllable) {
        this.components.push(component);
    }

    unregister(component: TreeControllable) {
        const pos = this.components.indexOf(component);
        this.components.splice(pos);
    }
}