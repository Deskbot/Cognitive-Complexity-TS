import { addStyleSheet, element } from "../../framework";

addStyleSheet("/css/component/generic/ToggleButton")

export function ToggleButton(isOpen: boolean, onOpennessChange: (isOpen: boolean) => void): Node {
    const input = element("input", {
        className: "togglebutton",
        onchange: () => {
            setStateClass(input);
            onOpennessChange(input.checked);
        },
        type: "checkbox",
    },
        "+"
    );

    input.checked = isOpen;
    setStateClass(input);

    return input;
}

function setStateClass(input: HTMLInputElement) {
    if (input.checked) {
        input.classList.remove("togglebutton--closed");
        input.classList.add("togglebutton--open");
    } else {
        input.classList.remove("togglebutton--open");
        input.classList.add("togglebutton--closed");
    }
}
