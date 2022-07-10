import ts from "typescript";
import { getIntroducedLocalName, getExpressionToAccessObjectMember } from "./node-naming";

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

    maybeAdd(node: ts.Node, variableBeingDefined: string | undefined): Scope {
        const { local, object } = this.scopeToAdd(node, variableBeingDefined);

        if (local.length !== 0 || object.length !== 0) {
            return new Scope([...this.local, ...local], [...this.object, ...object]);
        }

        return this;
    }

    private scopeToAdd(node: ts.Node, variableBeingDefined: string | undefined): { local: string[], object: string[] } {
        const local = [] as string[];
        const object = [] as string[];

        const introducedLocal = getIntroducedLocalName(node);
        if (introducedLocal !== undefined) {
            local.push(introducedLocal);
        }

        if (ts.isPropertyAssignment(node)
            || ts.isPropertyDeclaration(node)
            || ts.isMethodDeclaration(node)
            || ts.isAccessor(node)
        ) {
            if (variableBeingDefined !== undefined) {
                const name = node.getChildAt(0).getText();
                object.push(variableBeingDefined + "." + name);
            }
        }

        const maybeExpression = getExpressionToAccessObjectMember(node);
        if (maybeExpression !== undefined) {
            object.push(maybeExpression);

            if (variableBeingDefined) {
                object.push(variableBeingDefined + "." + maybeExpression);
                local.push(variableBeingDefined + "." + maybeExpression);
            }
        }

        return {
            local,
            object,
        }
    }
}
