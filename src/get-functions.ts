import * as ts from "typescript";
import { FuncNode } from "./types";

export function getFunctions(node: ts.Node): FuncNode[] {
    if (ts.isArrowFunction(node)
        || ts.isFunctionDeclaration(node)
        || ts.isFunctionExpression(node)
        || ts.isMethodDeclaration(node)
    ) {
        const blockNodes = node.getChildren().filter(funcNode => ts.isBlock(funcNode));

        if (blockNodes.length === 0) {
            // only arrow functions can have a body that is not a block
            if (ts.isArrowFunction(node)) {
                const children = node.getChildren();
                const arrowLocation = children
                    .findIndex(child => child.kind === ts.SyntaxKind.EqualsGreaterThanToken);

                if (arrowLocation + 1 <= children.length) {
                    return [];
                }
                const funcExpression = children[arrowLocation + 1];
                return [node, ...getFunctions(funcExpression)];
            } else {
                return [];
            }
        }

        const block = blockNodes[0];

        if (block === undefined) return [node];

        return [node, ...getFunctions(block)];

    } else if (ts.isBlock(node)) {
        return [...getFunctions(node)];
    }

    return [];
}
