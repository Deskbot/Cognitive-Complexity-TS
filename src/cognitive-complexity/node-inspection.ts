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

export function isSyntaxList(node: ts.Node): node is ts.SyntaxList {
    return node.kind === ts.SyntaxKind.SyntaxList;
}

export function isNewSequenceOfBinaryOperators(node: ts.Node, precedingOperator: ChainableBinaryOperator["kind"] | undefined) {
    if (!isChainableBinaryOperator(node)
        && node.kind !== ts.SyntaxKind.AmpersandAmpersandEqualsToken
        && node.kind !== ts.SyntaxKind.BarBarEqualsToken
        && node.kind !== ts.SyntaxKind.QuestionQuestionEqualsToken
    ) {
        return false;
    }

    // is now an operator, or is different to previous operator
    return precedingOperator === undefined || node.kind !== precedingOperator;
}

export function isNewSequenceOfBinaryTypeOperators(node: ts.Node, precedingTypeOperator: ChainableBinaryTypeOperator["kind"] | undefined) {
    if (!isChainableBinaryTypeOperator(node)) {
        return false;
    }

    return precedingTypeOperator !== node.kind;
}

export type ChainableBinaryOperator = ts.Node & {
    kind: ts.SyntaxKind.AmpersandAmpersandToken | ts.SyntaxKind.BarBarToken | ts.SyntaxKind.QuestionQuestionToken
};

export function isChainableBinaryOperator(node: ts.Node): node is ChainableBinaryOperator {
    return node.kind === ts.SyntaxKind.AmpersandAmpersandToken
        || node.kind === ts.SyntaxKind.BarBarToken
        || node.kind === ts.SyntaxKind.QuestionQuestionToken;
}

export type ChainableBinaryTypeOperator = ts.Node & {
    kind: ts.SyntaxKind.AmpersandToken | ts.SyntaxKind.BarToken
};

export function isChainableBinaryTypeOperator(node: ts.Node): node is ChainableBinaryTypeOperator {
    const isPartOfTypeExpression = node?.parent !== undefined // this is actually undefined-able
        && (ts.isUnionTypeNode(node.parent) || ts.isIntersectionTypeNode(node.parent)) // doing .parent skips the syntax list for some reason

    return isPartOfTypeExpression
        && (node.kind === ts.SyntaxKind.AmpersandToken || node.kind === ts.SyntaxKind.BarToken);
}

export function isInterruptInSequenceOfBinaryOperators(node: ts.Node) {
    return ts.isParenthesizedExpression(node)
        || ts.isParenthesizedTypeNode(node)
        || ts.isStatement(node)
        || ts.isBlock(node)
        || isFunctionNode(node)
        || ts.isTypeParameterDeclaration(node)

        // This is to solve angle brackets not being easy to interpret,
        // when breaking sequences of type operators.
        // T | T | T would be under one union type already.
        // This check would treat this whole expression as an interrupt.
        || ts.isUnionTypeNode(node)
        || ts.isIntersectionTypeNode(node)

        || (node.kind === ts.SyntaxKind.ColonToken && isFunctionNode(node.parent))
        || node.kind === ts.SyntaxKind.FirstAssignment; // separates extends expression from parameter default
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
