import { addStyleSheet, element } from "../../framework";
import { Box } from "./Box";
import { ToggleButton } from "./ToggleButton";

addStyleSheet(import.meta.url);

export class ToggleableBox {
    private showHideable: boolean;
    private toggleableContent: Node[];

    private box: Box;
    private toggleButton: ToggleButton;
    private visibleContent: Node[];

    constructor(
        visibleContent: Node[],
        toggleableContent: Node[],
        isTopLevel: boolean,
    ) {
        this.showHideable = isTopLevel;
        this.toggleableContent = toggleableContent; // TODO this is wrong, should lazily generate these nodes

        this.box = new Box();
        this.toggleButton = new ToggleButton(this.showHideable, (newIsOpen) => {
            this.showHideable = newIsOpen;
            this.rerender();
        });
        this.visibleContent = visibleContent;

        this.rerender();
    }

    get dom() {
        return this.box.dom;
    }

    changeHideableContent(toggleableContent: Node[]) {
        this.toggleableContent = toggleableContent;
        this.rerender();
    }

    private rerender() {
        this.box.rerender([
            (this.toggleableContent.length > 0
                ? this.toggleButton.dom
                : ""
            ),
            element("div", { className: "toggleablebox-content" },
                ...this.visibleContent,
                ...(this.showHideable
                    ? this.toggleableContent
                    : [])
            )
        ]);
    }

    setOpenness(open: boolean) {
        // this will trigger this object to change state to match
        this.toggleButton.setState(open);
    }
}
