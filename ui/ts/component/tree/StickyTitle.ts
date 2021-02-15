import { addStyleSheet, element } from "../../framework.js";

addStyleSheet(import.meta.url);

const maxZIndex = 2147483647;
const titleHeight = 39;

export class StickyTitle {
    readonly dom: HTMLParagraphElement;

    constructor(title: (string | Node)[], depth: number) {
        this.dom = element("p", { className: "stickytext" }, ...title);
        this.setDepth(depth);
    }

    setDepth(depth: number) {
        this.dom.style.top = `${targetYPos(depth)}px`; // boo! number comes from looking at the real height in the browser
        this.dom.style.zIndex = (maxZIndex - depth).toString();
    }
}

export function showInTree(elem: Element, depth: number) {
    const targetTopPos = targetYPos(depth);

    // if top of elem is above the target position, scroll it down.
    const rect = elem.getBoundingClientRect();

    if (rect.top < targetTopPos) {
        // put the top of the element at the top of the screen
        elem.scrollIntoView(true);

        // scroll the window down to put the element at its target position
        window.scrollBy(0, -targetTopPos);
    }
}

function targetYPos(depth: number): number {
    return titleHeight * (depth - 1);
}
