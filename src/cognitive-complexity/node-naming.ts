import * as ts from "typescript";
import { UnreachableNodeState } from "../util/node-util";
import {
    getIdentifier,
    FunctionNode,
    isFunctionNode,
    getTextWithoutBrackets
} from "./node-inspection";

export function chooseContainerName(node: ts.Node, variableBeingDefined: string | undefined): string | undefined {
    if (isFunctionNode(node)) {
        return getFunctionNodeName(node)
            ?? variableBeingDefined
            ?? "";
    }

    if (ts.isClassDeclaration(node)) {
        return getClassDeclarationName(node);
    }

    if (ts.isClassExpression(node)) {
        return getClassExpressionName(node, variableBeingDefined);
    }

    if (ts.isConstructorDeclaration(node)) {
        return "constructor";
    }

    if (ts.isInterfaceDeclaration(node)) {
        return getInterfaceDeclarationName(node);
    }

    if (ts.isModuleDeclaration(node)) {
        return getModuleDeclarationName(node);
    }

    if (ts.isTypeAliasDeclaration(node)) {
        return getTypeAliasName(node);
    }

    return undefined;
}

export function getIntroducedLocalName(node: ts.Node): string | undefined {
    if (ts.isVariableDeclaration(node)) {
        return getIdentifier(node);
    }

    if (ts.isClassDeclaration(node)) {
        return getClassDeclarationName(node);
    }

    if (ts.isClassExpression(node)) {
        return getClassExpressionName(node);
    }

    if (ts.isInterfaceDeclaration(node)) {
        return getInterfaceDeclarationName(node);
    }

    // functions not always defined in object scope
    if (ts.isArrowFunction(node)
        || ts.isFunctionDeclaration(node)
        || ts.isFunctionExpression(node)
    ) {
        return getFunctionNodeName(node);
    }

    if (ts.isTypeAliasDeclaration(node)) {
        return getTypeAliasName(node);
    }

    return undefined;
}

export function getNameIfCalledNode(node: ts.Node): string | undefined {
    if (ts.isCallExpression(node)) {
        return getCalledFunctionName(node);
    }

    if (ts.isNewExpression(node)) {
        return getNewedConstructorName(node);
    }

    if (ts.isPropertyAccessExpression(node)) {
        return node.getText();
    }

    if (ts.isJsxOpeningLikeElement(node)) {
        return node.getChildAt(1).getText();
    }

    if (ts.isTypeReferenceNode(node)) {
        return node.getChildAt(0).getText();
    }

    if (ts.isTaggedTemplateExpression(node)) {
        return node.getChildAt(0).getText();
    }

    return undefined;
}

export function getNameOfAssignment(node: ts.Node): string | undefined {
    if (ts.isVariableDeclaration(node)
        || ts.isPropertyDeclaration(node)
        || ts.isPropertyAssignment(node)
        || ts.isBindingElement(node)
        || ts.isTypeElement(node)
        || ts.isEnumDeclaration(node)
        || ts.isEnumMember(node)
        || ts.isCallSignatureDeclaration(node)
    ) {
        return getIdentifier(node);
    }

    if (ts.isTypeAliasDeclaration(node)) {
        return getTypeAliasName(node);
    }

    return undefined;
}

export function getExpressionToAccessObjectMember(node: ts.Node): string | undefined {
    if (ts.isMethodDeclaration(node)) {
        const [name, requiresDot] = getMethodDeclarationName(node);

        if (requiresDot) {
            return "this." + name;
        } else {
            return "this" + name;
        }
    }

    if (ts.isAccessor(node)) {
        const [name, requiresDot] = getAccessorIdentifierName(node);

        if (requiresDot) {
            return "this." + name;
        } else {
            return "this" + name;
        }
    }

    return undefined;
}

/**
 * @return [name, requires dot syntax]
 */
function getAccessorIdentifierName(node: ts.Node): [string, boolean] {
    for (const child of node.getChildren()) {
        if (ts.isMemberName(child)) {
            return [child.getText(), true];
        }

        if (ts.isComputedPropertyName(child)) {
            return [child.getText(), false];
        }
    }

    throw new UnreachableNodeState(node, "The accessor was expected to have an identifier or computed property name.");
}

function getIdentifierDespiteBrackets(node: ts.Node): string | undefined {
    if (ts.isMemberName(node) || ts.isElementAccessExpression(node)) {
        return node.getText();
    }

    if (ts.isParenthesizedExpression(node)) {
        return getIdentifierDespiteBrackets(node.getChildAt(1));
    }

    return undefined;
}

function getCalledFunctionName(node: ts.CallExpression): string {
    const children = node.getChildren();
    const expressionToCall = children[0];
    const name = getIdentifierDespiteBrackets(expressionToCall);

    return name ?? "";
}

function getClassDeclarationName(node: ts.ClassDeclaration): string {
    const name = getIdentifier(node);
    return name ?? ""; // anonymous class
}

function getClassExpressionName(
    node: ts.ClassExpression,
    variableBeingDefined: string | undefined = undefined
): string | undefined {
    return maybeGetFirstIdentifierName(node)
        ?? variableBeingDefined;
}

function getFunctionNodeName(func: FunctionNode): string | undefined {
    if (ts.isAccessor(func)) {
        const [name] = getAccessorIdentifierName(func);
        return name;
    }

    if (ts.isArrowFunction(func)) {
        return undefined;
    }

    if (ts.isFunctionDeclaration(func)) {
        const functionKeywordIndex = func.getChildren()
            .findIndex(node => node.kind === ts.SyntaxKind.FunctionKeyword);
        const identifier = func.getChildAt(functionKeywordIndex + 1);

        return identifier.getText();
    }

    if (ts.isFunctionExpression(func)) {
        const maybeIdentifier = func.getChildren()[1];
        if (ts.isMemberName(maybeIdentifier)) {
            return maybeIdentifier.getText();
        } else {
            return undefined;
        }
    }

    if (ts.isMethodDeclaration(func)) {
        const [name] = getMethodDeclarationName(func);
        return name;
    }

    throw new UnreachableNodeState(func, "FunctionNode is not of a recognised type.");
}

function getInterfaceDeclarationName(node: ts.InterfaceDeclaration): string {
    return node.getChildAt(1).getText();
}

function getModuleDeclarationName(node: ts.ModuleDeclaration): string {
    const moduleKeywordIndex = node.getChildren()
        .findIndex(node => node.kind === ts.SyntaxKind.NamespaceKeyword
            || node.kind === ts.SyntaxKind.ModuleKeyword);

    if (moduleKeywordIndex === -1) {
        throw new UnreachableNodeState(node, "Module has no module/namespace keyword.");
    }

    const moduleIdentifier = node.getChildAt(moduleKeywordIndex + 1);
    return moduleIdentifier.getText();
}

/**
 * @return [name, requires dot syntax]
 */
function getMethodDeclarationName(node: ts.MethodDeclaration): [string, boolean] {
    for (const child of node.getChildren()) {
        if (ts.isMemberName(child)) {
            return [child.getText(), true];
        }

        if (ts.isComputedPropertyName(child)) {
            return [child.getText(), false];
        }
    }

    throw new UnreachableNodeState(node, "Method has no identifier.");
}

function getNewedConstructorName(node: ts.NewExpression): string {
    return getTextWithoutBrackets(node.getChildAt(1));
}

function getTypeAliasName(node: ts.TypeAliasDeclaration): string {
    return node.getChildAt(1).getText();
}

function maybeGetFirstIdentifierName(node: ts.Node): string | undefined {
    const name = node.getChildren()
        .find(child => ts.isMemberName(child));

    return name?.getText();
}
