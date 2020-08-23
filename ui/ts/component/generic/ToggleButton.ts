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
    setStateOfAllToggleButtons(true);
}

export function collapseAllToggleButtons() {
    setStateOfAllToggleButtons(false);
}

function setStateOfAllToggleButtons(checked: boolean) {
    const buttons = document.getElementsByClassName("togglebutton") as HTMLCollectionOf<HTMLInputElement>;
    for (const button of bakeHtmlCollection(buttons)) {
        if (button.checked !== checked) {
            button.checked = checked;
            button.dispatchEvent(new Event("change"));
        }
    }
}
