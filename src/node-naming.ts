import * as ts from "typescript";
import { Unreachable } from "./util";
import { getIdentifier, FunctionNode } from "./node-inspection";

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

export function getClassExpressionName(
    node: ts.ClassExpression,
    variableBeingDefined: string | undefined = undefined
): string | undefined {
    const firstChild = node.getChildAt(1);
    if (ts.isIdentifier(firstChild)) {
        return firstChild.getText();
    }

    return variableBeingDefined ?? undefined;
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

export function getInterfaceDeclarationName(node: ts.InterfaceDeclaration): string {
    return node.getChildAt(1).getText();
}

export function getModuleDeclarationName(node: ts.ModuleDeclaration): string {
    return node.getChildAt(1).getText();
}

export function getNewedConstructorName(node: ts.NewExpression): string {
    const name = getName(node.getChildAt(1));
    if (name !== undefined) {
        return name;
    }

    throw new Unreachable();
}

export function getPropertyAccessName(node: ts.PropertyAccessExpression): string {
    const expressionNodes = node.getChildren();
    const identifier = expressionNodes[expressionNodes.length - 1];
    return identifier.getText();
}

export function getTypeAliasName(node: ts.TypeAliasDeclaration): string {
    return node.getChildAt(1).getText();
}
