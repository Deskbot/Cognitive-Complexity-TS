import { addStyleSheet, element } from "../../framework";

addStyleSheet(import.meta.url);

export class ToggleButton {
    readonly dom: HTMLElement;
    private input: HTMLInputElement;
    private symbol: Text;

    private onStateChange: (isOpen: boolean) => void;

    constructor(isOpen: boolean, onStateChange: (isOpen: boolean) => void) {
        this.onStateChange = onStateChange;

        this.dom = element("label", {
            className: "togglebutton-label",
        },
            this.input = element("input", {
                checked: isOpen,
                className: "togglebutton-input",
                type: "checkbox",
            }),
            this.symbol = new Text(""),
        );

        this.dom.addEventListener("change", () => this.handleStateChange());

        this.setSymbol();
    }

    private handleStateChange() {
        this.setSymbol();
        this.onStateChange(this.input.checked);
    }

    setState(open: boolean) {
        this.input.checked = open;
        this.handleStateChange();
    }

    private setSymbol() {
        if (this.input.checked) {
            this.symbol.textContent = "-";
        } else {
            this.symbol.textContent = "+";
        }
    }
}
