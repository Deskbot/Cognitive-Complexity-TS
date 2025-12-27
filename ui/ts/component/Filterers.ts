import { ComplexityController, Include } from "../complexity-tree/ComplexityController.js";
import { ToggleControl } from "./controls/ToggleControl.js";

export function Filterers(controller: ComplexityController) {

    const includeFolders = new ToggleControl(true, "Include Folders", (state) => {
        // folders implies files
        if (state) {
            includeFiles.setState(true);
        }

        controller.setInclude(Include.folders, state);
    });

    const includeFiles = new ToggleControl(true, "Include Files", (state) => {
        // no files implies no folders
        if (!state) {
            includeFolders.setState(false);
        }

        controller.setInclude(Include.files, state);
    });

    const includeNamespaces = new ToggleControl(true, "Include Namespaces", (state) => {
        controller.setInclude(Include.namespaces, state);
    });

    const includeClasses = new ToggleControl(true, "Include Classes", (state) => {
        controller.setInclude(Include.classes, state);
    });

    return [
        includeFolders.dom,
        includeFiles.dom,
        includeNamespaces.dom,
        includeClasses.dom,
    ];
}
