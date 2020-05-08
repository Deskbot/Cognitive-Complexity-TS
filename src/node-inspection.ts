// todo split this file by node naming and other inspection

import * as ts from "typescript";
import { ColumnAndLine } from "./types";
import { repeat, Unreachable } from "./util";

export type ForLikeStatement = ts.ForStatement | ts.ForInOrOfStatement;

export type FunctionNode = ts.AccessorDeclaration
    | ts.ArrowFunction
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.MethodDeclaration;

export function getName(node: ts.Node): string | undefined {
    if (ts.isIdentifier(node)) {
        return node.getText();
    }

    if (ts.isParenthesizedExpression(node)) {
        return getName(node.getChildAt(1));
    }

    return undefined;
}

export function getCalledFunctionName(node: ts.CallExpression): string {
    const children = node.getChildren();
    const expressionToCall = children[0];
    const name = getName(expressionToCall);

    return name ?? "";
}

export function getClassDeclarationName(node: ts.ClassDeclaration): string {
    const name = getIdentifier(node);
    return name ?? ""; // anonymous class
}

export function getColumnAndLine(node: ts.Node): ColumnAndLine {
    const lineAndCol = node.getSourceFile()
        .getLineAndCharacterOfPosition(node.getStart());

    return {
        column: lineAndCol.character + 1,
        line: lineAndCol.line + 1,
    };
}

export function getFunctionNodeName(
    func: FunctionNode,
    variableBeingDefined: string | undefined = undefined
): string {
    if (ts.isAccessor(func)) {
        return func.getChildAt(1).getText();
    }

    if (ts.isArrowFunction(func)) {
        return variableBeingDefined ?? "";
    }

    if (ts.isFunctionDeclaration(func)) {
        return func.getChildAt(1).getText();
    }

    if (ts.isFunctionExpression(func)) {
        const maybeIdentifier = func.getChildren()[1];
        if (ts.isIdentifier(maybeIdentifier)) {
            return maybeIdentifier.getText();
        } else {
            return variableBeingDefined ?? "";
        }
    }

    if (ts.isMethodDeclaration(func)) {
        const name = getIdentifier(func);

        if (name !== undefined) {
            return name;
        }

        throw new Unreachable("Method has no identifier.");
    }

    throw new Unreachable("FunctionNode is not of a recognised type.");
}

export function getIdentifier(node: ts.Node): string | undefined {
    for (const child of node.getChildren()) {
        if (ts.isIdentifier(child)) {
            return child.getText();
        }
    }

    return undefined;
}

export function getInterfaceDeclarationName(node: ts.InterfaceDeclaration): string {
    return node.getChildAt(1).getText();
}

export function getModuleDeclarationName(node: ts.ModuleDeclaration): string {
    return node.getChildAt(1).getText();
}

export function getNewedConstructorName(node: ts.NewExpression): string {
    return node.getChildAt(1).getText();
}

export function getPropertyAccessName(node: ts.PropertyAccessExpression): string {
    const expressionNodes = node.getChildren();
    const identifier = expressionNodes[expressionNodes.length - 1];
    return identifier.getText();
}

export function getTypeAliasName(node: ts.TypeAliasDeclaration): string {
    return node.getChildAt(1).getText();
}

export function isBinaryTypeOperator(node: ts.Node): node is ts.UnionOrIntersectionTypeNode {
    return ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node);
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

export function isContainer(node: ts.Node): boolean {
    return isFunctionNode(node)
        || ts.isClassDeclaration(node)
        || ts.isConstructorDeclaration(node)
        || ts.isInterfaceDeclaration(node)
        || ts.isModuleDeclaration(node)
        || ts.isTypeAliasDeclaration(node)
        || ts.isSourceFile(node)
        || ts.isSourceFile(node.parent);
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
        || ts.isMethodDeclaration(node)
        || ts.isAccessor(node);
}

export function isSequenceOfDifferentBooleanOperations(node: ts.Node): boolean {
    if (!ts.isBinaryExpression(node)) {
        return false;
    }

    const operatorToken = node.getChildAt(1);

    if (!ts.isToken(operatorToken)) {
        return false;
    }

    const operatorIsBoolean = operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
        || operatorToken.kind === ts.SyntaxKind.BarBarToken
        || operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken;

    // todo encapsulate getting this ancestor
    let firstNonParenthesisAncestor = node.parent;

    if (firstNonParenthesisAncestor === undefined) {
        return false;
    }

    while (ts.isParenthesizedExpression(firstNonParenthesisAncestor)) {
        firstNonParenthesisAncestor = firstNonParenthesisAncestor.parent;
    }

    if (operatorIsBoolean) {
        // True if the parent does not use the same operator as this node.
        // Presumably true if the parent is not a binary expression.
        // Child number 1 is the operator token.
        return firstNonParenthesisAncestor.getChildAt(1)?.kind != operatorToken.kind;
    }

    return false;
}

export function isSyntaxList(node: ts.Node): node is ts.SyntaxList {
    return node.kind === ts.SyntaxKind.SyntaxList;
}

export function report(node: ts.Node, depth: number = 0) {
    const toLog = [repeat("\t", depth), ts.SyntaxKind[node.kind], node.kind];

    console.error(...toLog);

    for (const child of node.getChildren()) {
        report(child, depth + 1);
    }
}
