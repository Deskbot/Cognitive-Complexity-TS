import { ProgramOutput } from "../../../shared/types";
import { DataController } from "../controller/DataController.js";
import { TreeController } from "../controller/TreeController.js";
import { element } from "../framework.js";
import { hasMoreThanOneKey } from "../util/util.js";
import { GlobalControl } from "./controls/GlobalControl.js";
import { GlobalToggleControl } from "./controls/GlobalToggleControl.js";
import { FolderContents } from "./tree/FolderContents.js";

export function Main(complexity: ProgramOutput) {
    const controller = new TreeController();

    const dataController = new DataController(complexity);

    // If there is only one top level node, show it expanded.
    // Otherwise show all nodes minimised by default.
    const onlyOneTopLevelNode = hasMoreThanOneKey(complexity);

    const topLevelBoxes = new FolderContents(controller, complexity, "", onlyOneTopLevelNode);

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
        GlobalToggleControl(false, hide => hide ? "Show Folders" : "Hide Folders", () => {

        }),
        GlobalToggleControl(false, hide => hide ? "Show Files" : "Hide Files", () => {

        }),

        topLevelBoxes.dom
    );
}
