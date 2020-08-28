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
