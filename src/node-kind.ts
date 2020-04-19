import * as ts from "typescript";

export type ForLikeStatement = ts.ForStatement | ts.ForInOrOfStatement;

export type FunctionNode = ts.ArrowFunction
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.MethodDeclaration;

export function isBreakOrContinueToLabel(node: ts.Node): boolean {
    if (ts.isBreakOrContinueStatement(node)) {
        for (const child of node.getChildren()) {
            if (ts.isIdentifier(child)) {
                return true;
            }
        }
    }

    return false;
}

export function isForLikeStatement(node: ts.Node): node is ForLikeStatement {
    return ts.isForInStatement(node)
        || ts.isForOfStatement(node)
        || ts.isForStatement(node);
}

export function isFunctionNode(node: ts.Node): node is FunctionNode {
    return ts.isArrowFunction(node)
        || ts.isFunctionDeclaration(node)
        || ts.isFunctionExpression(node)
        || ts.isMethodDeclaration(node);
}

export function isSyntaxList(node: ts.Node): node is ts.SyntaxList {
    return node.kind === ts.SyntaxKind.SyntaxList;
}

export function isTopLevel(node: ts.Node): boolean {
    const parent = node.parent;

    // TODO check what the parent of a ts.SourceFile is
    if (parent === undefined) {
        console.trace();
        return true;
    }

    if (ts.isSourceFile(parent)) {
        return true;
    }

    let highestNonBlockAncestor = parent;
    while (ts.isBlock(highestNonBlockAncestor)) {
        highestNonBlockAncestor = highestNonBlockAncestor.parent;
    }

    if (highestNonBlockAncestor === parent) {
        return false;
    }

    return isTopLevel(highestNonBlockAncestor);
}
