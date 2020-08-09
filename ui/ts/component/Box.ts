import { element, addStyleSheet } from "../framework";

addStyleSheet("/css/component/Box");

export function Box(children: (Node | string)[]): Node {
    return element("div", { className: "box" }, children);
}
