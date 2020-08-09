import { element, addStyleSheet, StatefulNode, emptyChildNodes } from "../framework";

addStyleSheet("/css/component/Box");

export class Box implements StatefulNode {
    readonly dom = element("div", { className: "box" });

    rerender(childNodes: (Node | string)[]) {
        emptyChildNodes(this.dom);
        this.dom.append(...childNodes);
    }
}
