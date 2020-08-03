import { FileOutput } from "../../../shared/types";
import { element } from "../framework";
import { ContainerComplexity } from "./ContainerComplexity";

export function FileComplexity(filePath: string, complexity: FileOutput): Node {
    return element("div", {}, [
        element("p", {}, [filePath]),
        element("p", {}, ["score: " + complexity.score]),
        ...complexity.inner.map(ContainerComplexity)
    ]);
}
