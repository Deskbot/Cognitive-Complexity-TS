import { ContainerOutput } from "../../../shared/types";
import { element } from "../framework";

export function ContainerComplexity(complexity: ContainerOutput): Node {
    return element("div", {}, [
        element("p", {},
            [`${complexity.name} Line ${complexity.line}, Column ${complexity.column}`]
        ),
        element("p", {},
            [`Score: ${complexity.score}`]
        ),
        ...complexity.inner.map(ContainerComplexity)
    ]);
}
