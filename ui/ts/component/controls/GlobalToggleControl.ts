import { GlobalControl } from "./GlobalControl.js";

export function GlobalToggleControl(initialState: boolean, getName: (state: boolean) => string, onClick: () => void) {
    let state = initialState;

    const button = GlobalControl(getName(initialState), () => {
        state = !state;
        button.innerText = getName(state);
        onClick();
    });

    return button;
}
