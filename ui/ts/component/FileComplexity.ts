import { FileOutput } from "../../../shared/types";
import { element } from "../framework";

export function FileComplexity(filePath: string, complexity: FileOutput): Node {
    return element("div", {}, [
        filePath,
        "score: " + complexity.score,
    ]);
}
