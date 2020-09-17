import { ProgramOutput } from "../../../shared/types";
import { TreeController } from "../controller/TreeController.js";
import { element } from "../framework.js";
import { hasMoreThanOneKey } from "../util.js";
import { GlobalControl } from "./controls/GlobalControl.js";
import { FolderContents } from "./tree/FolderContents.js";

export function Main(complexity: ProgramOutput) {
    const controller = new TreeController();

    // If there is only one top level node, show it expanded.
    // Otherwise show all nodes minimised by default.
    const onlyOneTopLevelNode = hasMoreThanOneKey(complexity);

    const topLevelBoxes = new FolderContents(controller, complexity, onlyOneTopLevelNode);

    return element("main", {},
        GlobalControl("Expand All", () => {
            controller.expandAll();
        }),
        GlobalControl("Collapse All", () => {
            controller.collapseAll();
        }),
        GlobalControl("Sort In Order", () => {
            controller.sortInOrder();
        }),
        GlobalControl("Sort By Complexity", () => {
            controller.sortByComplexity();
        }),

        topLevelBoxes.dom
    );
}
