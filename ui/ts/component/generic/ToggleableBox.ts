import { addStyleSheet, constClassToNodeFunc, element, StatefulNode } from "../../framework";
import { Box } from "../Box";
import { ToggleButton } from "./ToggleButton";

addStyleSheet("/css/component/generic/ToggleableBox");

export const ToggleableBox = constClassToNodeFunc(class implements StatefulNode {
    private showToggleable;
    private toggleButton;
    private box = new Box();

    readonly dom = this.box.dom;

    constructor(
        private visibleContent: Node[],
        private makeToggleableContent: () => Node[],
        isTopLevel: boolean,
    ) {
        this.showToggleable = isTopLevel;
        this.toggleButton = ToggleButton(this.showToggleable, this.onNewIsOpen.bind(this));
    }

    private getToggleableContent(): Node[] {
        const result = this.makeToggleableContent();

        this.getToggleableContent = () => result;

        return result;
    }

    private onNewIsOpen(newIsOpen: boolean) {
        this.showToggleable = newIsOpen;
        this.rerender();
    }

    rerender() {
        const content = [...this.visibleContent];

        if (this.showToggleable) {
            content.push(...this.getToggleableContent());
        }

        const boxContent = [] as Node[];

        if (this.makeToggleableContent().length > 0) {
            boxContent.push(this.toggleButton);
        }

        boxContent.push(
            element("div", { className: "toggleablebox-content" }, content)
        );

        this.box.rerender(boxContent);
    }
});
