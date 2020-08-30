import { addStyleSheet, element } from "../../framework";
import { Box } from "./Box";
import { ToggleButton } from "./ToggleButton";

addStyleSheet(import.meta.url);

export class ToggleableBox {
    private showHideable: boolean;
    private makeToggleableContent: () => ToggleableBox[];

    private box: Box;
    private toggleButton: ToggleButton;
    private visibleContent: Node[];

    constructor(
        visibleContent: Node[],
        makeToggleableContent: () => ToggleableBox[],
        isTopLevel: boolean,
    ) {
        this.showHideable = isTopLevel;
        this.makeToggleableContent = makeToggleableContent;

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

    private getHideableContent(): ToggleableBox[] {
        const result = this.makeToggleableContent();
        this.getHideableContent = () => result;
        return result;
    }

    private rerender() {
        this.box.rerender([
            (this.getHideableContent().length > 0
                ? this.toggleButton.dom
                : ""
            ),
            element("div", { className: "toggleablebox-content" },
                ...this.visibleContent,
                ...(this.showHideable
                    ? this.getHideableContent().map(content => content.dom)
                    : [])
            )
        ]);
    }

    setTreeOpenness(open: boolean) {
        // this will trigger this object to change state to match
        this.toggleButton.setState(open);

        // set all the children to the same state
        this.getHideableContent().forEach((toggleableBox) => {
            toggleableBox.setTreeOpenness(open);
        });
    }
}
