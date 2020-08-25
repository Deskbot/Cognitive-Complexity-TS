import { addStyleSheet, bakeHtmlCollection, element } from "../../framework";

addStyleSheet("/css/component/generic/ToggleButton");

export function ToggleButton(isOpen: boolean, onOpennessChange: (isOpen: boolean) => void): Node {
    const input = element("input", {
        className: "togglebutton",
        type: "checkbox",
    });
    input.addEventListener("change", () => {
        setSymbol(input);
        onOpennessChange(input.checked);
    });

    input.checked = isOpen;
    setSymbol(input);

    return input;
}

function setSymbol(button: HTMLInputElement) {
    if (button.checked) {
        button.innerHTML = "-";
    } else {
        button.innerHTML = "+";
    }
}

export function expandAllToggleButtons() {
    const buttons = document.getElementsByClassName("togglebutton") as HTMLCollectionOf<HTMLInputElement>;
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        if (button.checked !== true) {
            button.checked = true;
            button.dispatchEvent(new Event("change"));
        }
    }
}

export function collapseAllToggleButtons() {
    const buttons = document.getElementsByClassName("togglebutton") as HTMLCollectionOf<HTMLInputElement>;
    for (const button of bakeHtmlCollection(buttons)) {
        if (button.checked !== false) {
            button.checked = false;
            button.dispatchEvent(new Event("change"));
        }
    }
}
