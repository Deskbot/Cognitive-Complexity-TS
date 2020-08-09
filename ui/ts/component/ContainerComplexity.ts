import { ContainerOutput } from "../../../shared/types";
import { renderOnce, element } from "../framework";
import { Box } from "./Box";

export function ContainerComplexity(complexity: ContainerOutput): Node {
    return renderOnce(Box, [
        element("p", {},
            [`${complexity.name} Line ${complexity.line}, Column ${complexity.column}`]
        ),
        element("p", {},
            [`Score: ${complexity.score}`]
        ),
        ...complexity.inner.map(ContainerComplexity)
    ]);
}
