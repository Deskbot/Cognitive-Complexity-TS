import ts from "typescript";
import { getIntroducedLocalName, getNameIfObjectMember } from "./node-naming";

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

    private localToAdd(node: ts.Node, variableBeingDefined: string | undefined): string | undefined {
        return getIntroducedLocalName(node)
            ?? variableBeingDefined;
    }

    private objectToAdd(node: ts.Node, variableBeingDefined: string | undefined): string[] | undefined {
        if (ts.isPropertyAssignment(node)) {
            if (variableBeingDefined === undefined) {
                return undefined;
            }

            const name = node.getChildAt(0).getText();
            return [variableBeingDefined + "." + name];
        }

        const maybeName = getNameIfObjectMember(node);
        if (maybeName === undefined) {
            return undefined;
        }

        const newObjectNames = [...this.object, "this." + maybeName];
        if (variableBeingDefined) {
            newObjectNames.push(variableBeingDefined + "." + maybeName);
        }

        return newObjectNames;
    }

    maybeAddLocal(node: ts.Node, variableBeingDefined: string | undefined): Scope {
        const local = this.localToAdd(node, variableBeingDefined);
        if (local !== undefined) {
            return new Scope([...this.local, local], this.object);
        }

        return this;
    }

    maybeAddObject(node: ts.Node, variableBeingDefined: string | undefined): Scope {
        const object = this.objectToAdd(node, variableBeingDefined);
        if (object !== undefined) {
            return new Scope(this.local, [...this.object, ...object]);
        }

        return this;
    }
}
