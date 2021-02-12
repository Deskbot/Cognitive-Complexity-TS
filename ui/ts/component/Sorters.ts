import { ComplexityController, Sort } from "../complexity-tree/ComplexityController.js";
import { ToggleControl } from "./controls/ToggleControl.js";

export function Sorters(controller: ComplexityController) {
    function updateSort() {
        if (sortInOrder.getState()) {
            controller.setSortBy(Sort.inOrder);
        } else if (sortByComplexity.getState()) {
            controller.setSortBy(Sort.complexity);
        }
    }

    const sortInOrder = new ToggleControl(true, "Sort A-Z & By Line", (state) => {
        sortByComplexity.setState(!state);
        updateSort();
    });

    const sortByComplexity = new ToggleControl(false, "Sort By Complexity", (state) => {
        sortInOrder.setState(!state);
        updateSort();
    });

    return [
        sortInOrder.dom,
        sortByComplexity.dom,
    ];
}