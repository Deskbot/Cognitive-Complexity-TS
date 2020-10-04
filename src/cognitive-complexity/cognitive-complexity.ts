import * as ts from "typescript"
import { FileOutput, ContainerOutput, ScoreAndInner } from "../../shared/types";
import { countNotAtTheEnds } from "../util/util";
import {
    chooseContainerName,
    getNameIfCalledNode,
    getIntroducedName
} from "./node-naming";
import { whereAreChildren } from "./depth";
import {
    isContainer,
    getColumnAndLine,
    isSequenceOfDifferentBooleanOperations,
    isBreakOrContinueToLabel,
    isBinaryTypeOperator
} from "./node-inspection";
import { Scope } from "./Scope";

export function fileCost(file: ts.SourceFile): FileOutput {
    return nodeCost(file, true);
}

function aggregateCostOfChildren(
    children: ts.Node[],
    childDepth: number,
    topLevel: boolean,
    scope: Scope,
    variableBeingDefined: string | undefined,
): ScoreAndInner {
    let score = 0;

    // The inner containers of a node is defined as the concat of:
    // * all child nodes that are functions/namespaces/classes
    // * all containers declared directly under a non-container child node
    const inner = [] as ContainerOutput[];

    for (const child of children) {
        const childCost = nodeCost(child, topLevel, childDepth, scope);

        score += childCost.score;

        // a function/class/namespace/type is part of the inner scope we want to output
        const name = chooseContainerName(child, variableBeingDefined);

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

function inherentCost(node: ts.Node, scope: Scope): number {
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
        return scope.includes(calledName) ? 1 : 0;
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

/**
 * @param node The node whose cost we want
 * @param topLevel Whether the node is at the top level of a file
 * @param depth The depth the node is at
 * @param scope The scope at the node
 */
function nodeCost(
    node: ts.Node,
    topLevel: boolean,
    depth = 0,
    scope = new Scope([], []),
): ScoreAndInner {
    let score = inherentCost(node, scope);
    score += costOfDepth(node, depth);

    // the name being introduced if there is one
    const variableBeingDefined = getIntroducedName(node);

    // get the ancestors container names from the perspective of this node's children
    const namedAncestorsOfChildren = scope
        .maybeAddLocal(node, variableBeingDefined)
        .maybeAddObject(node, variableBeingDefined);
    const { same, below } = whereAreChildren(node);

    const costOfSameDepthChildren = aggregateCostOfChildren(same, depth, topLevel, namedAncestorsOfChildren, variableBeingDefined);

    // The nodes below this node have the same depth number,
    // iff this node is top level and it is a container.
    const container = isContainer(node);
    const depthOfBelow = depth + (topLevel && container ? 0 : 1);
    const costOfBelowChildren = aggregateCostOfChildren(below, depthOfBelow, false, namedAncestorsOfChildren, variableBeingDefined);

    score += costOfSameDepthChildren.score;
    score += costOfBelowChildren.score;

    const inner = [...costOfSameDepthChildren.inner, ...costOfBelowChildren.inner];

    return {
        inner,
        score,
    };
}
