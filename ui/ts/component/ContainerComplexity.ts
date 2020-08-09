import { ContainerOutput } from "../../../shared/types";
import { element, addStyleSheet } from "../framework";
import { Box } from "./Box";

addStyleSheet("/css/component/ContainerComplexity");

export function ContainerComplexity(complexity: ContainerOutput): Node {
    return Box([
        element("p", {},
            [`${complexity.name} Line ${complexity.line}, Column ${complexity.column}`]
        ),
        element("p", {},
            [`Score: ${complexity.score}`]
        ),
        ...complexity.inner.map(ContainerComplexity)
    ]);
}
