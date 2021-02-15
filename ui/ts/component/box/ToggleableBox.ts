import { flexGrow, flexNone } from "../../flex.js";
import { addStyleSheet, element } from "../../framework.js";
import { computeOnce } from "../../util.js";
import { FlexBox } from "./FlexBox.js";
import { ToggleButton } from "./ToggleButton.js";

addStyleSheet(import.meta.url);

export class ToggleableBox {
    private box: FlexBox;
    private toggleableContent: () => Node[];
    private toggleableContentWrapper: ContentWrapper;
    private toggleButton: ToggleButton;
    private visibleContent: Node[];

    private showHideable: boolean;

    constructor(visibleContent: Node[], isTopLevel: boolean, onStateChange: (isOpen: boolean) => void) {
        this.showHideable = isTopLevel;

        this.box = new FlexBox();
        this.toggleableContent = () => [];
        this.toggleableContentWrapper = flexGrow(new ContentWrapper());
        this.toggleButton = flexNone(new ToggleButton(this.showHideable, (newIsOpen) => {
            this.showHideable = newIsOpen;
            this.rerender();
            onStateChange(newIsOpen);
        }));
        this.visibleContent = visibleContent;

        this.rerender();
    }

    get dom(): HTMLElement {
        return this.box.dom;
    }

    changeHideableContent(toggleableContent: () => Node[]) {
        this.toggleableContent = computeOnce(toggleableContent);
        this.rerender();
    }

    private rerender() {
        this.toggleableContentWrapper.rerender(
            this.visibleContent,
            this.showHideable
                ? this.toggleableContent()
                : []
        );

        this.box.rerender([
            (this.toggleableContent().length > 0
                ? this.toggleButton.dom
                : ""
            ),
            this.toggleableContentWrapper.dom,
        ]);
    }

    setOpenness(open: boolean) {
        // this will trigger this object to change state to match
        this.toggleButton.setState(open);
    }
}

class ContentWrapper {
    readonly dom: HTMLDivElement;

    constructor() {
        this.dom = element(
            "div",
            { className: "toggleablebox-contentwrapper" },
        );
    }

    rerender(visibleContent: Node[], toggleableContent: Node[]) {
        this.dom.innerHTML = "";
        this.dom.append(...visibleContent);
        this.dom.append(...toggleableContent);
    }
}
