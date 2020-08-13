import { constClassToNodeFunc, StatefulNode } from "../../framework";
import { Box } from "../Box";
import { ToggleButton } from "./ToggleButton";

export const ToggleableBox = constClassToNodeFunc(class implements StatefulNode {
    private showToggleable;
    private toggleButton;
    private box = new Box();

    readonly dom = this.box.dom;

    constructor(
        private visibleContent: Node[],
        private toggleableContent: Node[],
        isTopLevel: boolean,
    ) {
        this.showToggleable = isTopLevel;
        this.toggleButton = ToggleButton(this.showToggleable, this.onNewIsOpen.bind(this));
    }

    private onNewIsOpen(newIsOpen: boolean) {
        this.showToggleable = newIsOpen;
        this.rerender();
    }

    rerender() {
        const boxContents = [] as Node[];

        if (this.toggleableContent.length > 0) {
            boxContents.push(this.toggleButton);
        }

        boxContents.push(...this.visibleContent);

        if (this.showToggleable) {
            boxContents.push(...this.toggleableContent);
        }

        this.box.rerender(boxContents);
    }
});
