import ts from "typescript";
import { findIntroducedName, getNameIfNameDeclaration } from "./node-naming";

export class Scope {
    readonly local: ReadonlyArray<string>;
    readonly object: ReadonlyArray<string>;

    constructor(local: ReadonlyArray<string>, object: ReadonlyArray<string>) {
        this.local = local;
        this.object = object;
    }

    includes(name: string) {
        return this.local.includes(name) || this.object.includes(name);
    }

    maybeAddLocal(node: ts.Node): Scope {
        const containerNameMaybe = findIntroducedName(node);
        if (containerNameMaybe !== undefined) {
            return new Scope([...this.local, containerNameMaybe], []);
        }

        const variableNameMaybe = getNameIfNameDeclaration(node);
        if (variableNameMaybe !== undefined) {
            return new Scope([...this.local, variableNameMaybe], []);
        }

        return this;
    }
}
