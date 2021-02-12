import { ProgramOutput } from "../../../shared/types";
import { ComplexityController } from "../complexity-tree/ComplexityController.js";
import { Tree } from "./tree/Tree.js";
import { element } from "../framework.js";
import { ButtonControl } from "./controls/ButtonControl.js";
import { ComplexityModel } from "../complexity-tree/ComplexityModel.js";
import { Filterers } from "./Filterers.js";
import { Sorters } from "./Sorters.js";

export function Main(complexity: ProgramOutput) {
    const view = new Tree();
    const model = new ComplexityModel(view);
    const controller = new ComplexityController(complexity, model, view);

    return element("main", {},
        ButtonControl("Expand All", () => {
            controller.expandAll();
        }),
        ButtonControl("Collapse All", () => {
            controller.collapseAll();
        }),

        ...Sorters(controller),
        ...Filterers(controller),

        view.dom
    );
}
