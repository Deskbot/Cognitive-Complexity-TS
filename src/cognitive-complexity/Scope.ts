import ts from "typescript";
import { findIntroducedLocalName, getNameIfNameDeclaration } from "./node-naming";

/**
 * Contains all names that could be recursively referenced.
 */
export class Scope {
    /**
     * Variables that can be referenced as is from a scope.
     */
    readonly local: ReadonlyArray<string>;
    /**
     * Variables that can only be referenced with a prefix in the scope.
     */
    readonly object: ReadonlyArray<string>;

    constructor(local: ReadonlyArray<string>, object: ReadonlyArray<string>) {
        this.local = local;
        this.object = object;
    }

    includes(name: string) {
        return this.local.includes(name) || this.object.includes(name);
    }

    maybeAddLocal(node: ts.Node): Scope {
        const containerNameMaybe = findIntroducedLocalName(node);
        if (containerNameMaybe !== undefined) {
            return new Scope([...this.local, containerNameMaybe], this.object);
        }

        const variableNameMaybe = getNameIfNameDeclaration(node);
        if (variableNameMaybe !== undefined) {
            return new Scope([...this.local, variableNameMaybe], this.object);
        }

        return this;
    }

    maybeAddObject(node: ts.Node, variableBeingDefined: string | undefined): Scope {
        if (ts.isPropertyAssignment(node)) {
            if (variableBeingDefined === undefined) {
                return this;
            }

            const name = node.getChildAt(0).getText();
            return new Scope(this.local, [...this.object, variableBeingDefined + "." + name]);
        }

        if (ts.isMethodDeclaration(node)) {
            const name = node.getChildAt(0).getText();

            const newObjectNames = [...this.object, "this." + name];
            if (variableBeingDefined) {
                newObjectNames.push(variableBeingDefined + "." + name);
            }

            return new Scope(this.local, newObjectNames);
        }

        return this;
    }
}
