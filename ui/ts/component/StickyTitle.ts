import { addStyleSheet, element } from "../framework";
import { CopyText } from "./generic/CopyText";

addStyleSheet("/css/component/StickyTitle");

export function StickyTitle(text: string): Node {
    return element("p", { className: "stickytext" },
        text,
        CopyText(text),
    );
}
