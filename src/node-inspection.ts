import * as ts from "typescript";
import { ColumnAndLine } from "./types";

export type ForLikeStatement = ts.ForStatement | ts.ForInOrOfStatement;

export type FunctionNode = ts.ArrowFunction
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.MethodDeclaration;

export function getCalledFunctionName(node: ts.CallExpression): string {
    const children = node.getChildren();
    const expressionToCall = children[0];

    if (ts.isIdentifier(expressionToCall)) {
        return expressionToCall.getText();
    }

    if (ts.isPropertyAccessExpression(expressionToCall)) {
        const expressionNodes = expressionToCall.getChildren();
        const identifier = expressionNodes[expressionNodes.length - 1];
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

export function getDeclarationName(node: ts.NamedDeclaration): string {
    const identifier = node.getChildAt(0).getText();
    return identifier;
}

export function getFunctionNodeName(
    func: FunctionNode,
    variableBeingDefined: string | undefined = undefined
): string {
    if (ts.isArrowFunction(func)) {
        return variableBeingDefined ?? "";
    }

    if (ts.isFunctionDeclaration(func)) {
        return func.getChildren()[1].getText();
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
        return func.getChildren()[0].getText();
    }

    // unreachable

    console.error("Unreachable code branch reached.");
    console.error("FunctionNode is not of a recognised type.");
    console.trace();

    return "";
}

export function getModuleDeclarationName(node: ts.ModuleDeclaration): string {
    return node.getChildAt(1).getText();
}

export function getTypeAliasName(node: ts.TypeAliasDeclaration): string {
    return node.getChildAt(1).getText();
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

/**
 * @returns true, if the node can be used to assign an anonymous function/class/type with a name.
 * Here container means function/class/type.
 */
export function isNamedDeclarationOfContainer(node: ts.Node): node is ts.NamedDeclaration {
    // This is just a check for a subset of NamedDeclarations.
    // I don't know whether this includes too few or too many node types.
    return ts.isTypeParameterDeclaration(node)
        || ts.isVariableDeclaration(node)
        || ts.isPropertyDeclaration(node)
        || ts.isCallSignatureDeclaration(node)
        || ts.isBindingElement(node)
        || ts.isObjectLiteralElement(node)
        || ts.isClassLike(node)
        || ts.isClassElement(node)
        || ts.isTypeElement(node)
        || ts.isInterfaceDeclaration(node)
        || ts.isEnumDeclaration(node)
        || ts.isEnumMember(node);
}

export function isSequenceOfDifferentBinaryOperations(node: ts.BinaryExpression): boolean {
    // the child number 1 is the operator token
    // true if the parent does not use the same operator as this node
    // presumably true if the parent is not a binary expression
    return node.parent.getChildAt(1)?.kind != node.getChildAt(1).kind;
}

export function isSyntaxList(node: ts.Node): node is ts.SyntaxList {
    return node.kind === ts.SyntaxKind.SyntaxList;
}
