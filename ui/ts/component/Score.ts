import { addStyleSheet, element } from "../framework";

addStyleSheet("/css/component/Score");

export function Score(score: string | number) {
    return element("p", { className: "score" }, "Score: " + score)
}
