import { FileOutput } from "../../../shared/types";
import { element, renderUnstatefully } from "../framework";
import { ContainerComplexity } from "./ContainerComplexity";
import { Box } from "./Box";

export function FileComplexity(filePath: string, complexity: FileOutput): Node {
    return renderUnstatefully(Box, [
        element("p", {}, [filePath]),
        element("p", {}, ["score: " + complexity.score]),
        ...complexity.inner.map(ContainerComplexity)
    ]);
}
