import { flexGrow, flexNone } from "../../flex";
import { addStyleSheet, element } from "../../framework";
import { computeOnce } from "../../util";
import { FlexBox } from "./FlexBox";
import { ToggleButton } from "./ToggleButton";

addStyleSheet(import.meta.url);

export class ToggleableBox {
    private showHideable: boolean;

    private box: FlexBox;
    private toggleableContentWrapper: ContentWrapper;
    private toggleableContent: () => Node[];
    private toggleButton: ToggleButton;
    private visibleContent: Node[];

    constructor(
        visibleContent: Node[],
        isTopLevel: boolean,
    ) {
        this.showHideable = isTopLevel;
        this.toggleableContent = () => [];

        this.box = new FlexBox();
        this.toggleButton = flexNone(new ToggleButton(this.showHideable, (newIsOpen) => {
            this.showHideable = newIsOpen;
            this.rerender();
        }));
        this.toggleableContentWrapper = flexGrow(new ContentWrapper());
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
