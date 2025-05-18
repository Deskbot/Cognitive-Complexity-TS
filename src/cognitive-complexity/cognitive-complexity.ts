import * as ts from "typescript"
import { FileOutput, ContainerOutput, ScoreAndInner, TraversalContext } from "../../shared/types";
import { countNotAtTheEnds } from "../util/util";
import {
    chooseContainerName,
    getNameIfCalledNode,
    getNameOfAssignment
} from "./node-naming";
import { whereAreChildren } from "./depth";
import {
    isContainer,
    getColumnAndLine,
    isBreakOrContinueToLabel,
    isBinaryTypeOperator,
    passThroughNameBeingAssigned,
} from "./node-inspection";
import { Scope } from "./Scope";

export function fileCost(file: ts.SourceFile): FileOutput {
    return nodeCost(file, true).scoreAndInner;
}

function aggregateCostOfChildren(
    children: ts.Node[],
    childDepth: number,
    topLevel: boolean,
    scope: Scope,
    variableBeingDefined: string | undefined,
    precedingOperator: ts.BinaryOperatorToken | undefined,
): TraversalContext {
    let score = 0;

    // The inner containers of a node is defined as the concat of:
    // * all child nodes that are functions/namespaces/classes
    // * all containers declared directly under a non-container child node
    const inner = [] as ContainerOutput[];

    for (const child of children) {
        const context = nodeCost(child, topLevel, childDepth, scope, variableBeingDefined, precedingOperator);
        const childCost = context.scoreAndInner;
        precedingOperator = context.precedingOperator;

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
        scoreAndInner: {
            score,
            inner
        },
        precedingOperator,
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

function inherentCost(node: ts.Node, scope: Scope, precedingOperator: ts.BinaryOperatorToken | undefined): number {
    // certain language features carry and inherent cost
    if (isNewSequenceOfBinaryOperators(node, precedingOperator)
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
    variableBeingDefined: string | undefined = undefined,
    precedingOperator: ts.BinaryOperatorToken | undefined = undefined,
): TraversalContext {

    // get the ancestors container names from the perspective of this node's children
    const namedAncestorsOfChildren = scope.maybeAdd(node, variableBeingDefined);
    const { left, right, below } = whereAreChildren(node);

    /**
     * The name being introduced (if there is one)
     * for a variable whose declaration this scope is directly inside of.
     * It is used to give names to anonymous functions and classes.
     * let a =    $a$         () => { $anonymous$ };
     * let a =  ( $a$         () => { $anonymous$ } );
     * let a = f( $anonymous$ () => { $anonymous$ } );
     */
    let newVariableBeingDefined = getNameOfAssignment(node);
    if (newVariableBeingDefined === undefined && passThroughNameBeingAssigned(node)) {
        newVariableBeingDefined = variableBeingDefined;
    }

    if (ts.isParenthesizedExpression(node) || ts.isParenthesizedTypeNode(node) || ts.isStatement(node) || ts.isBlock(node)) {
        precedingOperator = undefined;
    }

    // Do in order traversal. Expand the left node first. This is so we can have the correct preceding operator.
    const leftChildren = aggregateCostOfChildren(left, depth, topLevel, scope, variableBeingDefined, precedingOperator);
    precedingOperator = leftChildren.precedingOperator;

    let score = inherentCost(node, scope, precedingOperator);
    score += costOfDepth(node, depth);

    if (ts.isBinaryExpression(node)) {
        precedingOperator = node.operatorToken;
    }

    const rightChildren = aggregateCostOfChildren(right, depth, topLevel, scope, variableBeingDefined, precedingOperator);
    precedingOperator = rightChildren.precedingOperator;

    if (ts.isParenthesizedExpression(node) || ts.isParenthesizedTypeNode(node) || ts.isStatement(node) || ts.isBlock(node)) {
        precedingOperator = undefined;
    }

    const costOfSameDepthChildren = {
        score: leftChildren.scoreAndInner.score + rightChildren.scoreAndInner.score,
        inner: [...leftChildren.scoreAndInner.inner, ...rightChildren.scoreAndInner.inner],
    }

    // The nodes below this node have the same depth number,
    // iff this node is top level and it is a container.
    const container = isContainer(node);
    const depthOfBelow = depth + (topLevel && container ? 0 : 1);
    const costOfBelowChildren = aggregateCostOfChildren(below, depthOfBelow, false, namedAncestorsOfChildren, newVariableBeingDefined, undefined);

    score += costOfSameDepthChildren.score;
    score += costOfBelowChildren.scoreAndInner.score;

    const inner = [...costOfSameDepthChildren.inner, ...costOfBelowChildren.scoreAndInner.inner];

    return {
        scoreAndInner: {
            inner,
            score,
        },
        precedingOperator,
    };
}

function isNewSequenceOfBinaryOperators(node: ts.Node, precedingOperator: ts.BinaryOperatorToken | undefined) {
    if (!ts.isBinaryExpression(node)) {
        return false;
    }

    if (node.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken
        && node.operatorToken.kind !== ts.SyntaxKind.BarBarToken
        && node.operatorToken.kind !== ts.SyntaxKind.QuestionQuestionToken
    ) {
        return false;
    }

    // is now an operator, or is different to previous operator
    return precedingOperator === undefined || node.operatorToken.kind !== precedingOperator.kind;
}
