import { element } from "../framework";
import { collapseAllToggleButtons, expandAllToggleButtons } from "./generic/ToggleButton";

export function ExpandAll(): Node {
    const button = element("button", {}, "Expand All");
    button.addEventListener("click", expandAllToggleButtons);
    return button;
}

export function CollapseAll(): Node {
    const button = element("button", {}, "Collapse All");
    button.addEventListener("click", collapseAllToggleButtons);
    return button;
}
