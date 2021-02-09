import { ProgramOutput } from "../../../shared/types";
import { DataController } from "../controller/DataController.js";
import { TreeController } from "../controller/TreeController.js";
import { element } from "../framework.js";
import { GlobalControl } from "./controls/GlobalControl.js";
import { GlobalToggleControl } from "./controls/GlobalToggleControl.js";

export function Main(complexity: ProgramOutput) {
    const treeController = new TreeController();
    const dataController = new DataController(complexity, treeController);

    const topLevelBoxes = dataController.makeTree();

    return element("main", {},
        GlobalControl("Expand All", () => {
            treeController.expandAll();
        }),
        GlobalControl("Collapse All", () => {
            treeController.collapseAll();
        }),
        GlobalControl("Sort In Order", () => {
            dataController.sortInOrder();
        }),
        GlobalControl("Sort By Complexity", () => {
            dataController.sortByComplexity();
        }),
        GlobalToggleControl(true, "Include Folders", () => {

        }),
        GlobalToggleControl(true, "Include Files", () => {

        }),

        topLevelBoxes.dom
    );
}
