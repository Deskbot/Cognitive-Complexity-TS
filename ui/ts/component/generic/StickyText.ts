import { addStyleSheet, element } from "../../framework";
import { CopyText } from "../generic/CopyText";

addStyleSheet("/css/component/generic/StickyText");

export function StickyText(text: string): Node {
    return element("p", { className: "stickytext" },
        text,
        CopyText(text),
    );
}
