import { element } from "../../framework";

export function ToggleButton(isOpen: boolean, onOpennessChange: (isOpen: boolean) => void): Node {
    const input = element("input", {
        className: "toggle-button",
        onchange: () => {
            setStateClass(input);
            onOpennessChange(input.checked);
        },
        type: "checkbox",
    }, [
        "+"
    ]);

    input.checked = isOpen;
    setStateClass(input);

    return input;
}

function setStateClass(input: HTMLInputElement) {
    if (input.checked) {
        input.classList.remove("toggle-button--closed");
        input.classList.add("toggle-button--open");
    } else {
        input.classList.remove("toggle-button--open");
        input.classList.add("toggle-button--closed");
    }
}
