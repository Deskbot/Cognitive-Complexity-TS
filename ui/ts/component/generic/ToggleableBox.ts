import { addStyleSheet, element } from "../../framework";
import { Box } from "./Box";
import { ToggleButton } from "./ToggleButton";

addStyleSheet("/css/component/generic/ToggleableBox");

export class ToggleableBox {
    private showHideable;
    private toggleButton;
    private box = new Box();

    constructor(
        private visibleContent: Node[],
        private makeToggleableContent: () => ToggleableBox[],
        isTopLevel: boolean,
    ) {
        this.showHideable = isTopLevel;
        this.toggleButton = ToggleButton(this.showHideable, this.onNewIsOpen.bind(this));
        this.rerender();
    }

    get dom() {
        return this.box.dom;
    }

    setOpenness(beOpen: boolean) {
        this.showHideable = beOpen;
        this.getHideableContent().forEach((toggleableBox) => {
            toggleableBox.setOpenness(beOpen);
        })
        this.rerender();
    }

    private getHideableContent(): ToggleableBox[] {
        const result = this.makeToggleableContent();

        this.getHideableContent = () => result;

        return result;
    }

    private onNewIsOpen(newIsOpen: boolean) {
        this.showHideable = newIsOpen;
        this.rerender();
    }

    private rerender() {
        const content = [...this.visibleContent];

        if (this.showHideable) {
            this.getHideableContent().forEach((innerToggleableBox) => {
                content.push(innerToggleableBox.dom);
            });
        }

        const boxContent = [] as Node[];

        if (this.getHideableContent().length > 0) {
            boxContent.push(this.toggleButton);
        }

        boxContent.push(
            element("div", { className: "toggleablebox-content" }, ...content)
        );

        this.box.rerender(boxContent);
    }
}
