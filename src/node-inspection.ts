import * as ts from "typescript";
import { FunctionNodeInfo } from "./types";

export type ForLikeStatement = ts.ForStatement | ts.ForInOrOfStatement;

export type FunctionNode = ts.ArrowFunction
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.MethodDeclaration;

export function getClassDeclarationInfo(node: ts.ClassDeclaration): FunctionNodeInfo {
    const lineAndCol = node.getSourceFile()
        .getLineAndCharacterOfPosition(node.getStart());

    return {
        column: lineAndCol.character + 1,
        line: lineAndCol.line + 1,
        name: node.getChildren()[1].getText(),
    };
}

export function getFunctionNodeInfo(func: FunctionNode): FunctionNodeInfo {
    const lineAndCol = func.getSourceFile()
        .getLineAndCharacterOfPosition(func.getStart());

    return {
        column: lineAndCol.character + 1,
        line: lineAndCol.line + 1,
        name: getFunctionNodeName(func),
    };
}

function getFunctionNodeName(func: FunctionNode): string {
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

export function getModuleDeclarationInfo(node: ts.ModuleDeclaration): FunctionNodeInfo {
    const lineAndCol = node.getSourceFile()
        .getLineAndCharacterOfPosition(node.getStart());

    return {
        column: lineAndCol.character + 1,
        line: lineAndCol.line + 1,
        name: node.getChildren()[1].getText(),
    };
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
