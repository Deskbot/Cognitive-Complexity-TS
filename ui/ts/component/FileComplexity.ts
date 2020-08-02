import { FileOutput } from "../../../shared/types";
import { element } from "../framework";

export function FileComplexity(complexity: FileOutput): Node {
    return element("div", {}, [
        "score: " + complexity.score,
    ]);
}
