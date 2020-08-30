import { addStyleSheet, element } from "../framework";

addStyleSheet(import.meta.url);

export function Score(score: string | number) {
    return element("p", { className: "score" }, "Score: " + score)
}
