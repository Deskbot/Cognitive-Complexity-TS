import { element, addStyleSheet, StatefulNode } from "../framework";

addStyleSheet("/css/component/Box");

export class Box implements StatefulNode {
    readonly dom = element("div", { className: "box" });

    rerender(newChildNodes: (Node | string)[]) {
        this.dom.prepend(...newChildNodes);

        // only the new child nodes should remain
        // everything from [0..newChildNodes.length-1] is valid
        // everything after should be removed
        for (let indexToRemove = newChildNodes.length;
            this.dom.childNodes.length > newChildNodes.length;
            indexToRemove++
        ) {
            this.dom.removeChild(this.dom.childNodes[indexToRemove]);
        }
    }
}
