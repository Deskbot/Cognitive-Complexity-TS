import * as ts from "typescript";
import { ColumnAndLine } from "./types";
import { repeat } from "./util";

export type ForLikeStatement = ts.ForStatement | ts.ForInOrOfStatement;

export type FunctionNode = ts.AccessorDeclaration
    | ts.ArrowFunction
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.MethodDeclaration;

export function getCalledFunctionName(node: ts.CallExpression): string {
    const children = node.getChildren();

    const expressionToCall = children[0];

    if (ts.isIdentifier(expressionToCall)) {
        return expressionToCall.getText();
    }

    return "";
}

export function getClassDeclarationName(node: ts.ClassDeclaration): string {
    return node.getChildAt(1).getText();
}

export function getColumnAndLine(node: ts.Node): ColumnAndLine {
    const lineAndCol = node.getSourceFile()
        .getLineAndCharacterOfPosition(node.getStart());

    return {
        column: lineAndCol.character + 1,
        line: lineAndCol.line + 1,
    };
}

// todo this only works for some declarations
export function getDeclarationName(node: ts.NamedDeclaration): string {
    const identifier = node.getChildAt(0).getText();
    return identifier;
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
        return func.getChildAt(0).getText();
    }

    // unreachable

    console.error("Unreachable code branch reached.");
    console.error("FunctionNode is not of a recognised type.");
    console.trace();

    return "";
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

/**
 * @returns true, if the node can be used to assign an anonymous function/class/type with a name.
 * Here container means function/class/type.
 */
// todo check that the first child is the identifier for all of these
export function isNamedDeclarationOfContainer(node: ts.Node): node is ts.NamedDeclaration {
    // This is just a check for a subset of NamedDeclarations.
    // I don't know whether this includes too few or too many node types.
    return ts.isTypeParameterDeclaration(node)
        || ts.isVariableDeclaration(node)
        || ts.isPropertyDeclaration(node)
        || ts.isCallSignatureDeclaration(node)
        || ts.isBindingElement(node)
        || ts.isTypeElement(node)
        || ts.isEnumDeclaration(node)
        || ts.isEnumMember(node);
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
