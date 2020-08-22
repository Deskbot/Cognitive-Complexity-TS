import { addStyleSheet, element } from "../../framework";

addStyleSheet("/css/component/generic/ToggleButton")

export function ToggleButton(isOpen: boolean, onOpennessChange: (isOpen: boolean) => void): Node {
    const input = element("input", {
        className: "togglebutton",
        onchange: () => {
            setSymbol(input);
            onOpennessChange(input.checked);
        },
        type: "checkbox",
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
