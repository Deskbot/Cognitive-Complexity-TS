import * as ts from "typescript";
import { ColumnAndLine } from "./types";

export type ForLikeStatement = ts.ForStatement | ts.ForInOrOfStatement;

export type FunctionNode = ts.ArrowFunction
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.MethodDeclaration;

export function getCallableName(node: ts.Node): string | undefined {
    if (isFunctionNode(node)) {
        const name = getFunctionNodeName(node);
        if (name.length !== 0) {
            return name;
        }
    } else if (ts.isVariableDeclaration(node)) {
        const identifier = node.getChildAt(0).getText();
        return identifier;
    }

    return undefined;
}

export function getCalledFunctionName(node: ts.CallExpression): string {
    const children = node.getChildren();
    const calledExpression = children[0];

    if (ts.isIdentifier(calledExpression)) {
        return calledExpression.getText();
    }

    if (ts.isPropertyAccessExpression(calledExpression)) {
        const identifier = children[children.length - 1];
        return identifier.getText();
    }

    return "";
}

export function getClassDeclarationName(node: ts.ClassDeclaration): string {
    return node.getChildren()[1].getText();
}

export function getColumnAndLine(node: ts.Node): ColumnAndLine {
    const lineAndCol = node.getSourceFile()
        .getLineAndCharacterOfPosition(node.getStart());

    return {
        column: lineAndCol.character + 1,
        line: lineAndCol.line + 1,
    };
}

export function getFunctionNodeName(func: FunctionNode): string {
    if (ts.isArrowFunction(func)) {
        return ""; // TODO figure out a decent name for this
    }

    if (ts.isFunctionDeclaration(func)) {
        return func.getChildren()[1].getText();
    }

    if (ts.isFunctionExpression(func)) {
        const maybeIdentifier = func.getChildren()[1];
        if (ts.isIdentifier(maybeIdentifier)) {
            return maybeIdentifier.getText();
        } else {
            return ""; // TODO figure out a decent name for this
        }
    }

    if (ts.isMethodDeclaration(func)) {
        return func.getChildren()[0].getText();
    }

    // unreachable

    console.error("Unreachable code branch reached.");
    console.error("FunctionNode is not of a recognised type.");
    console.trace();

    return "";
}

export function getModuleDeclarationName(node: ts.ModuleDeclaration): string {
    return node.getChildren()[1].getText();
}

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

export function maybeAddNodeToAncestorFuncs(node: ts.Node, ancestorsOfNode: IterableIterator<string>): IterableIterator<string> {
    const nodeNameIfCallable = getCallableName(node);
    if (nodeNameIfCallable !== undefined) {
        return [...ancestorsOfNode, nodeNameIfCallable].values();
    }

    return ancestorsOfNode;
}
