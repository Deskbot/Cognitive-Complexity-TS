import * as ts from "typescript"
import { FileOutput, FunctionOutput, ScoreAndInner } from "./types";
import { sum, countNotAtTheEnds } from "./util";
import {
    isFunctionNode,
    isBreakOrContinueToLabel,
    getColumnAndLine,
    getFunctionNodeName,
    getClassDeclarationName,
    getModuleDeclarationName,
    getCalledFunctionName,
    isSequenceOfDifferentBooleanOperations,
    getTypeAliasName,
    isBinaryTypeOperator,
    isContainer,
    getInterfaceDeclarationName,
    getNewedConstructorName,
    getPropertyAccessName,
    getIdentifier,
    getClassExpressionName
} from "./node-inspection";
import { whereAreChildren } from "./depth";

function aggregateCostOfChildren(
    children: ts.Node[],
    childDepth: number,
    topLevel: boolean,
    ancestorsOfChild: ReadonlyArray<string>
): ScoreAndInner {
    let score = 0;

    // The inner functions of a node is defined as the concat of:
    // * all child nodes that are functions/namespaces/classes
    // * all functions declared directly under a non function child node
    const inner = [] as FunctionOutput[];

    for (const child of children) {
        const childCost = nodeCost(child, topLevel, childDepth, ancestorsOfChild);

        score += childCost.score;

        // a function/class/namespace/type is part of the inner scope we want to output
        const variableBeingDefined = ancestorsOfChild[ancestorsOfChild.length - 1];
        const name = getNameIfContainer2(child, variableBeingDefined);

        if (name !== undefined) {
            inner.push({
                ...getColumnAndLine(child),
                ...childCost,
                name,
            });
        } else {
            // the child's inner is all part of this node's direct inner scope
            inner.push(...childCost.inner);
        }
    }

    return {
        score,
        inner
    };
}

function costOfDepth(node: ts.Node, depth: number): number {
    // increment for nesting level
    if (depth > 0) {
        if (ts.isCatchClause(node)
            || ts.isConditionalExpression(node)
            || ts.isConditionalTypeNode(node)
            || ts.isDoStatement(node)
            || ts.isForInStatement(node)
            || ts.isForOfStatement(node)
            || ts.isForStatement(node)
            || ts.isMappedTypeNode(node)
            || ts.isSwitchStatement(node)
            || ts.isWhileStatement(node)
            || (

                // increment for `if`, but not `else if`
                // The parent of the `if` within an `else if`
                // is the `if` the `else` belongs to.
                // However `if (...) if (...)` is treated as false here
                // even though technically there should be 2 increments.
                // This quirky syntax produces the same score as using `&&`,
                // so maybe it doesn't matter.
                ts.isIfStatement(node) && !ts.isIfStatement(node.parent)
            )
        ) {
            return depth;
        }
    }

    return 0;
}

// function for file cost returns FileOutput
export function fileCost(file: ts.SourceFile): FileOutput {
    // TODO can I just call nodeCost(file)
    const childCosts = file.getChildren()
        .map(elem => nodeCost(elem, true)); // using an arrow so it shows up in call hierarchy

    // score is sum of score for all child nodes
    const score = childCosts
        .map(childNode => childNode.score)
        .reduce(sum, 0);

    // inner is concat of all functions declared directly under every child node
    const inner = childCosts.map(childNode => childNode.inner).flat();

    return {
        inner,
        score,
    };
}

function inherentCost(node: ts.Node, namedAncestors: ReadonlyArray<string>): number {
    // certain language features carry and inherent cost
    if (isSequenceOfDifferentBooleanOperations(node)
        || ts.isCatchClause(node)
        || ts.isConditionalExpression(node)
        || ts.isConditionalTypeNode(node)
        || ts.isDoStatement(node)
        || ts.isForInStatement(node)
        || ts.isForOfStatement(node)
        || ts.isForStatement(node)
        || ts.isMappedTypeNode(node)
        || ts.isSwitchStatement(node)
        || ts.isWhileStatement(node)
        || isBreakOrContinueToLabel(node)
    ) {
        return 1;
    }

    const calledName = getNameIfCalledNode(node);
    if (calledName !== undefined) {
        return namedAncestors.includes(calledName) ? 1 : 0;
    }

    // An `if` may contain an else keyword followed by else code.
    // An `else if` is just the else keyword followed by an if statement.
    // Therefore this block is entered for both `if` and `else if`.
    if (ts.isIfStatement(node)) {
        // increment for `if` and `else if`
        let score = 1;

        // increment for solo else
        const children = node.getChildren();
        const elseIndex = children.findIndex(child => child.kind === ts.SyntaxKind.ElseKeyword);
        if (elseIndex !== -1) {
            const elseIf = ts.isIfStatement(children[elseIndex + 1]);
            if (!elseIf) {
                score += 1;
            }
        }

        return score;
    }

    if (isBinaryTypeOperator(node)) {
        // This node naturally represents a sequence of binary type operators.
        // (unlike normal binary operators)
        let score = 1;

        // However, this sequence can contain nodes that are a different binary operator.
        // We can assume that children of the internal syntax list that are binary operators
        // are not the same kind as this node.
        // Binary sub-expressions at either end of the syntax list
        // do not break this sequence of operators in the code; they merely bookend it.
        const syntaxList = node.getChildren()[0];
        const numOfSequenceInterrupts = countNotAtTheEnds(
            syntaxList.getChildren(),
            isBinaryTypeOperator
        );

        score += numOfSequenceInterrupts;

        return score;
    }

    return 0;
}

function nodeCost(
    node: ts.Node,
    topLevel: boolean,
    depth = 0,
    namedAncestors = [] as ReadonlyArray<string>,
): ScoreAndInner {
    let score = 0;

    score += inherentCost(node, namedAncestors);
    score += costOfDepth(node, depth);

    // get the ancestors container names from the perspective of this node's children
    const namedAncestorsOfChildren = maybeAddNodeToNamedAncestors(node, namedAncestors);
    const { same, below } = whereAreChildren(node);

    const costOfSameDepthChildren = aggregateCostOfChildren(same, depth, topLevel, namedAncestorsOfChildren);

    // todo can I pass the information needed here into whereAreChildren
    const container = isContainer(node);
    const depthOfBelow = depth + (topLevel && container ? 0 : 1);
    const costOfBelowChildren = aggregateCostOfChildren(below, depthOfBelow, false, namedAncestorsOfChildren);

    score += costOfSameDepthChildren.score;
    score += costOfBelowChildren.score;

    const inner = [...costOfSameDepthChildren.inner, ...costOfBelowChildren.inner];

    return {
        inner,
        score,
    };
}

// todo reduce the amount of checks for container types
function maybeAddNodeToNamedAncestors(
    node: ts.Node,
    ancestorsOfNode: ReadonlyArray<string>
): ReadonlyArray<string> {
    const containerNameMaybe = getNameIfContainer(node);
    if (containerNameMaybe !== undefined) {
        return [...ancestorsOfNode, containerNameMaybe];
    }

    const variableNameMaybe = getNameIfNameDeclaration(node);
    if (variableNameMaybe !== undefined) {
        return [...ancestorsOfNode, variableNameMaybe];
    }

    return ancestorsOfNode;
}

function getNameIfNameDeclaration(node: ts.Node): string | undefined {
    if (ts.isVariableDeclaration(node)
        || ts.isCallSignatureDeclaration(node)
        || ts.isBindingElement(node)
        || ts.isTypeElement(node)
        || ts.isEnumDeclaration(node)
        || ts.isEnumMember(node)
    ) {
        const identifier = node.getChildAt(0).getText();
        return identifier;
    }

    if (ts.isPropertyDeclaration(node)) {
        return getIdentifier(node);
    }

    if (ts.isTypeAliasDeclaration(node)) {
        return getTypeAliasName(node);
    }

    return undefined;
}

function getNameIfContainer(node: ts.Node): string | undefined {
    if (ts.isClassDeclaration(node)) {
        return getClassDeclarationName(node);
    }

    if (ts.isClassExpression(node)) {
        return getClassExpressionName(node);
    }

    if (ts.isConstructorDeclaration(node)) {
        return "constructor";
    }

    if (ts.isInterfaceDeclaration(node)) {
        return getInterfaceDeclarationName(node);
    }

    if (isFunctionNode(node)) {
        return getFunctionNodeName(node);
    }

    return undefined;
}

// todo find a decent name for these 2 functions
function getNameIfContainer2(node: ts.Node, variableBeingDefined: string): string | undefined {
    if (isFunctionNode(node)) {
        return getFunctionNodeName(node, variableBeingDefined);
    }

    if (ts.isClassDeclaration(node)) {
        return getClassDeclarationName(node);
    }

    if (ts.isClassExpression(node)) {
        return getClassExpressionName(node, variableBeingDefined);
    }

    const name = getNameIfContainer(node);
    if (name !== undefined) {
        return name;
    }

    if (ts.isModuleDeclaration(node)) {
        return getModuleDeclarationName(node);
    }

    if (ts.isTypeAliasDeclaration(node)) {
        return getTypeAliasName(node);
    }

    return undefined;
}

function getNameIfCalledNode(node: ts.Node): string | undefined {
    if (ts.isCallExpression(node)) {
        return getCalledFunctionName(node);
    }

    if (ts.isNewExpression(node)) {
        return getNewedConstructorName(node);
    }

    if (ts.isPropertyAccessExpression(node)) {
        return getPropertyAccessName(node);
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
