import * as ts from "typescript"
import { FileOutput, ContainerOutput, ScoreAndInner } from "../../shared/types";
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
    isSequenceOfDifferentBooleanOperations,
    isBreakOrContinueToLabel,
    isBinaryTypeOperator,
    passThroughNameBeingAssigned,
    isNegatedExpression
} from "./node-inspection";
import { Scope } from "./Scope";

/**
 * Calculates the complexity of an if condition based on the cognitive complexity spec.
 * Increments for each logical AND (&&) and OR (||) operator that is different from the previous one.
 * Negations (!) do not add complexity.
 */
function calculateConditionComplexity(expr: ts.Expression): number {
    let score = 0;
    let lastOperatorKind: ts.SyntaxKind | undefined = undefined;

    // Helper function to recursively process expressions
    function processExpression(node: ts.Node): void {
        if (isNegatedExpression(node)) {
            // Negation breaks the sequence of operators temporarily
            const savedLastOperator = lastOperatorKind;
            lastOperatorKind = undefined; // Reset for the negated expression's content

            // Process the operand of negation
            const children = node.getChildren();
            if (children.length > 1) {
                processExpression(children[1]); // The operand
            }

            // After processing the negated part, restore the operator sequence
            // context from *before* the negation.
            lastOperatorKind = savedLastOperator;
            return; // Don't process this node further as a binary/paren expr
        }

        if (ts.isBinaryExpression(node)) {
            const operatorToken = node.getChildAt(1);
            let currentOperatorKind: ts.SyntaxKind | undefined = undefined;

            if (ts.isToken(operatorToken)) {
                const kind = operatorToken.kind;

                // Check if it's a boolean operator we care about
                if (kind === ts.SyntaxKind.AmpersandAmpersandToken ||
                    kind === ts.SyntaxKind.BarBarToken) {
                    currentOperatorKind = kind;
                }
            }

            // Process left side first to establish the operator sequence order
            processExpression(node.left);

            // Increment score if the current operator is different from the last one seen
            if (currentOperatorKind !== undefined) {
                 if (lastOperatorKind === undefined || lastOperatorKind !== currentOperatorKind) {
                    score++;
                    lastOperatorKind = currentOperatorKind;
                 } else {
                    // Same operator, doesn't increment, but we continue the sequence
                 }
            }

            // Process right side
            processExpression(node.right);
        }
        else if (ts.isParenthesizedExpression(node)) {
            // Process the inner expression. The state of lastOperatorKind
            // might be updated by the inner expression and should persist.
            processExpression(node.expression);
        }
    }

    processExpression(expr);
    return score;
}

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
        const childCost = nodeCost(child, topLevel, childDepth, scope, variableBeingDefined);

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

        // Add complexity for mixed boolean operations in the condition
        if (node.expression) {
            // Calculate complexity for condition
            score += calculateConditionComplexity(node.expression);
        }

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
): ScoreAndInner {
    let score = inherentCost(node, scope);
    score += costOfDepth(node, depth);

    // get the ancestors container names from the perspective of this node's children
    const namedAncestorsOfChildren = scope
        .maybeAdd(node, variableBeingDefined);
    const { same, below } = whereAreChildren(node);

    /**
     * The name being introduced (if there is one)
     * for a variable whose declaration this scope is directly inside of.
     * It is used to give names to anonymous functions and classes.
     * let a =    $a$         () => {};
     * let a =  ( $a$         () => {} );
     * let a = f( $undefined$ () => {} );
     * let a =                      () => { $undefined$ };
     */
    let newVariableBeingDefined = getNameOfAssignment(node);
    if (newVariableBeingDefined === undefined
        && passThroughNameBeingAssigned(node)
    ) {
        newVariableBeingDefined = variableBeingDefined;
    }

    const costOfSameDepthChildren = aggregateCostOfChildren(same, depth, topLevel, namedAncestorsOfChildren, newVariableBeingDefined);

    // The nodes below this node have the same depth number,
    // iff this node is top level and it is a container.
    const container = isContainer(node);
    const depthOfBelow = depth + (topLevel && container ? 0 : 1);
    const costOfBelowChildren = aggregateCostOfChildren(below, depthOfBelow, false, namedAncestorsOfChildren, newVariableBeingDefined);

    score += costOfSameDepthChildren.score;
    score += costOfBelowChildren.score;

    const inner = [...costOfSameDepthChildren.inner, ...costOfBelowChildren.inner];

    return {
        inner,
        score,
    };
}
