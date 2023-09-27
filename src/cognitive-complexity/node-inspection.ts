import * as ts from "typescript";
import { ColumnAndLine } from "../../shared/types";
import { repeat } from "../util/util";

export type ForLikeStatement = ts.ForStatement | ts.ForInOrOfStatement;

export type FunctionNode = ts.AccessorDeclaration
    | ts.ArrowFunction
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.MethodDeclaration;

export function getColumnAndLine(node: ts.Node): ColumnAndLine {
    const lineAndCol = node.getSourceFile()
        .getLineAndCharacterOfPosition(node.getStart());

    return {
        column: lineAndCol.character + 1,
        line: lineAndCol.line + 1,
    };
}

export function getIdentifier(node: ts.Node): string | undefined {
    for (const child of node.getChildren()) {
        if (ts.isMemberName(child) || ts.isComputedPropertyName(child)) {
            return child.getText();
        }
    }

    return undefined;
}

export function getFirstNonParenthesizedAncestor(node: ts.Node): ts.Node {
    let firstNonParenthesisAncestor = node.parent;

    while (ts.isParenthesizedExpression(firstNonParenthesisAncestor)) {
        firstNonParenthesisAncestor = firstNonParenthesisAncestor.parent;
    }

    return firstNonParenthesisAncestor;
}

export function getTextWithoutBrackets(node: ts.Node): string {
    if (ts.isParenthesizedExpression(node)) {
        return node.getChildren()
            .slice(1, -1) // ignore the bracket at each end
            .map(getTextWithoutBrackets)
            .join("");
    }

    return node.getText();
}

export function isBinaryTypeOperator(node: ts.Node): node is ts.UnionOrIntersectionTypeNode {
    return ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node);
}

export function isBreakOrContinueToLabel(node: ts.Node): boolean {
    if (ts.isBreakOrContinueStatement(node)) {
        for (const child of node.getChildren()) {
            if (ts.isMemberName(child)) {
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

    const firstNonParenthesisAncestor = getFirstNonParenthesizedAncestor(node);

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

export function passThroughNameBeingAssigned(node: ts.Node): boolean {
    return isSyntaxList(node)
        || ts.isObjectLiteralExpression(node)
        || ts.isParenthesizedExpression(node);
}

export function report(node: ts.Node, depth: number = 0) {
    const toLog = [repeat("\t", depth), ts.SyntaxKind[node.kind], node.kind];

    console.error(...toLog);

    for (const child of node.getChildren()) {
        report(child, depth + 1);
    }
}
