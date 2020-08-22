import { addStyleSheet, domIterate, element } from "../../framework";

addStyleSheet("/css/component/generic/ToggleButton");

export function ToggleButton(isOpen: boolean, onOpennessChange: (isOpen: boolean) => void): Node {
    const input = element("input", {
        className: "togglebutton",
        type: "checkbox",
    });
    input.addEventListener("change", () => {
        setSymbol(input);
        onOpennessChange(input.checked);
    })

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
    for (const button of domIterate(buttons)) {
        button.checked = true;
        button.dispatchEvent(new Event("change"));
    }
}

export function collapseAllToggleButtons() {
    const buttons = document.getElementsByClassName("togglebutton") as HTMLCollectionOf<HTMLInputElement>;
    for (const button of domIterate(buttons)) {
        button.checked = false;
        button.dispatchEvent(new Event("change"));
    }
}
