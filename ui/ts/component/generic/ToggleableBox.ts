import { StatefulNode } from "../../framework";
import { Box } from "../Box";
import { ToggleButton } from "./ToggleButton";

export function ToggleableBox(visibleContent: Node[], toggleableContent: Node[]): Node {
    const poop = new Poop();
    poop.rerender(visibleContent, toggleableContent);
    return poop.dom;
}

class Poop implements StatefulNode {
    private toggleButton = ToggleButton(false, this.onNewIsOpen.bind(this));
    private box = new Box();
    private showToggleable = false;

    readonly dom = this.box.dom;

    private lastCall: [visibleContent: Node[], toggleableContent: Node[]] | undefined;

    private onNewIsOpen(newIsOpen: boolean) {
        this.showToggleable = newIsOpen;

        if (this.lastCall) {
            this.rerender(...this.lastCall);
        }
    }

    rerender(visibleContent: Node[], toggleableContent: Node[]) {
        this.lastCall = [visibleContent, toggleableContent];

        const boxContents = [] as Node[];

        if (toggleableContent.length > 0) {
            boxContents.push(this.toggleButton);
        }

        boxContents.push(...visibleContent);

        if (this.showToggleable) {
            boxContents.push(...toggleableContent);
        }

        this.box.rerender(boxContents);
    }
}
