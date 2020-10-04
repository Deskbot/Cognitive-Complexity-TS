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

    maybeAddLocal(node: ts.Node, variableBeingDefined: string | undefined): Scope {
        const containerNameMaybe = getIntroducedLocalName(node);
        if (containerNameMaybe !== undefined) {
            return new Scope([...this.local, containerNameMaybe], this.object);
        }

        if (variableBeingDefined !== undefined) {
            return new Scope([...this.local, variableBeingDefined], this.object);
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

        const maybeName = getNameIfObjectMember(node);
        if (maybeName !== undefined) {
            const newObjectNames = [...this.object, "this." + maybeName];
            if (variableBeingDefined) {
                newObjectNames.push(variableBeingDefined + "." + maybeName);
            }

            return new Scope(this.local, newObjectNames);
        }

        return this;
    }
}
