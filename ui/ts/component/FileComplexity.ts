import { FileOutput } from "../../../shared/types";
import { element, addStyleSheet } from "../framework";
import { ContainerComplexity } from "./ContainerComplexity";

addStyleSheet("/css/component/FileComplexity");

export function FileComplexity(filePath: string, complexity: FileOutput): Node {
    return element("div", {
        className: "file-complexity"
    }, [
        element("p", {}, [filePath]),
        element("p", {}, ["score: " + complexity.score]),
        ...complexity.inner.map(ContainerComplexity)
    ]);
}
