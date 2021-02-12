import { addStyleSheet, element } from "../../framework.js";

addStyleSheet(import.meta.url);

const maxZIndex = 2147483647;

export function StickyTitle(title: (string | Node)[], depth: number): Node {
    const p = element("p", { className: "stickytext" }, ...title);

    p.style.top = `${39 * (depth - 1)}px`; // boo! number comes from looking at the real height in the browser
    p.style.zIndex = (maxZIndex-depth).toString();

    return p;
}
