import { addStyleSheet, element } from "../../framework.js";

addStyleSheet(import.meta.url);

export class ToggleButton {
    readonly dom: HTMLElement;
    private input: HTMLInputElement;
    private stateSymbol: StateSymbol;

    private onStateChange: (isOpen: boolean) => void;

    constructor(
        isOpen: boolean,
        onStateChange: (isOpen: boolean) => void,
        onManualStateChange: (isOpen: boolean) => void
    ) {
        this.onStateChange = onStateChange;

        this.stateSymbol = new StateSymbol();

        this.dom = element("label", {
            className: "togglebutton-label",
        },
            this.input = element("input", {
                checked: isOpen,
                className: "togglebutton-input",
                type: "checkbox",
            }),
            this.stateSymbol.text,
        );

        this.dom.addEventListener("change", () => {
            this.handleStateChange();
            onManualStateChange(this.input.checked);
        });

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
        this.stateSymbol.setState(this.input.checked);
    }
}

class StateSymbol {
    readonly text = new Text("");

    setState(bool: boolean) {
        if (bool) {
            this.text.textContent = "-";
        } else {
            this.text.textContent = "+";
        }
    }
}
