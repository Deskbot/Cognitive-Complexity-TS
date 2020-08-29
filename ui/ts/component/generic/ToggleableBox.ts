import { addStyleSheet, element } from "../../framework";
import { Box } from "./Box";
import { ToggleButton } from "./ToggleButton";

addStyleSheet("/css/component/generic/ToggleableBox");

export class ToggleableBox {
    private showHideable: boolean;

    private box: Box;
    private makeToggleableContent: () => ToggleableBox[];
    private toggleButton;
    private visibleContent: Node[];

    constructor(
        visibleContent: Node[],
        makeToggleableContent: () => ToggleableBox[],
        isTopLevel: boolean,
    ) {
        this.showHideable = isTopLevel;

        this.box = new Box();
        this.makeToggleableContent = makeToggleableContent;
        this.toggleButton = new ToggleButton(this.showHideable, this.onNewIsOpen.bind(this));
        this.visibleContent = visibleContent;

        this.rerender();
    }

    get dom() {
        return this.box.dom;
    }

    setOpenness(beOpen: boolean) {
        this.showHideable = beOpen;
        this.rerender();

        this.getHideableContent().forEach((toggleableBox) => {
            toggleableBox.setOpenness(beOpen);
        });
        this.toggleButton.setState(this.showHideable);
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
            boxContent.push(this.toggleButton.dom);
        }

        boxContent.push(
            element("div", { className: "toggleablebox-content" }, ...content)
        );

        this.box.rerender(boxContent);
    }
}
