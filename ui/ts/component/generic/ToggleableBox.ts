import { addStyleSheet, element } from "../../framework";
import { Box } from "./Box";
import { ToggleButton } from "./ToggleButton";

addStyleSheet("/css/component/generic/ToggleableBox");

export class ToggleableBox {
    private showHideable: boolean;

    private box: Box;
    private makeToggleableContent: () => ToggleableBox[];
    private toggleButton: ToggleButton;
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
        const content = element("div", { className: "toggleablebox-content" }, ...this.visibleContent);

        if (this.showHideable) {
            this.getHideableContent().forEach((innerToggleableBox) => {
                content.append(innerToggleableBox.dom);
            });
        }

        const buttonAndContent = [] as Node[];

        if (this.getHideableContent().length > 0) {
            buttonAndContent.push(this.toggleButton.dom);
        }

        buttonAndContent.push(content);

        this.box.rerender(buttonAndContent);
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
