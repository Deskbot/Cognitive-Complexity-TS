import { addStyleSheet, element } from "../framework";
import { collapseAllToggleButtons, expandAllToggleButtons } from "./generic/ToggleButton";

addStyleSheet("/css/component/global-controls");

export function ExpandAll(): Node {
    const button = element(
        "button",
        { className: "global-control-button" },
        "Expand All"
    );
    button.addEventListener("click", expandAllToggleButtons);
    return button;
}

export function CollapseAll(): Node {
    const button = element(
        "button",
        { className: "global-control-button" },
        "Collapse All"
    );
    button.addEventListener("click", collapseAllToggleButtons);
    return button;
}
