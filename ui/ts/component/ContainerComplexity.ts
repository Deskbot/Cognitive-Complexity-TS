import { ContainerOutput } from "../../../shared/types";
import { element } from "../framework";
import { ToggleableBox } from "./generic/ToggleableBox";

export function ContainerComplexity(complexity: ContainerOutput): Node {
    return ToggleableBox([
        element("p", {},
            [`${complexity.name} Line ${complexity.line}, Column ${complexity.column}`]
        ),
        element("p", {},
            [`Score: ${complexity.score}`]
        ),
    ],
        complexity.inner.map(ContainerComplexity),
        false,
    );
}
