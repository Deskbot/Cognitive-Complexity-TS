import * as ts from "typescript"
import { FileOutput, ContainerOutput, ScoreAndInner, TraversalContext, MutableTraversalContext } from "../../shared/types";
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
    passThroughNameBeingAssigned,
    isInterruptInSequenceOfBinaryOperators,
    isNewSequenceOfBinaryOperators,
    isNewSequenceOfBinaryTypeOperators,
    isBinaryTypeOperator,
} from "./node-inspection";
import { Scope } from "./Scope";

export function fileCost(file: ts.SourceFile): FileOutput {
    const initialContext: TraversalContext = {
        depth: 0,
        scope: new Scope([], []),
        topLevel: true,
        variableBeingDefined: undefined,
    };

    const initialMutableContext: MutableTraversalContext = {
        precedingOperator: undefined,
        precedingTypeOperator: undefined,
    };

    return nodeCost(file, initialContext, initialMutableContext);
}

function aggregateCostOfChildren(
    children: ts.Node[],
    ctx: TraversalContext,
    mutCtx: MutableTraversalContext,
): ScoreAndInner {
    let score = 0;

    // The inner containers of a node is defined as the concat of:
    // * all child nodes that are functions/namespaces/classes
    // * all containers declared directly under a non-container child node
    const inner = [] as ContainerOutput[];

    for (const child of children) {
        const childCost = nodeCost(child, ctx, mutCtx);

        score += childCost.score;

        // a function/class/namespace/type is part of the inner scope we want to output
        const name = chooseContainerName(child, ctx.variableBeingDefined);

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

    return { score, inner };
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

function inherentCost(node: ts.Node, scope: Scope, mutCtx: Readonly<MutableTraversalContext>): number {
    // certain language features carry and inherent cost
    if (isNewSequenceOfBinaryOperators(node, mutCtx.precedingOperator)
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
        || isNewSequenceOfBinaryTypeOperators(node, mutCtx.precedingTypeOperator)
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

    return 0;
}

/**
 * @param node The node whose cost we want
 * @param ctx Information about the context a node is in, which is needed to know the node cost.
 * @param mutCtx Same as above, but this information can be changed while traversing,
 *               which will provide information up the call stack (where this function is called and higher).
 */
function nodeCost(
    node: ts.Node,
    ctx: TraversalContext,
    mutCtx: MutableTraversalContext,
): ScoreAndInner {
    const { depth, topLevel, scope, variableBeingDefined } = ctx;

    // get the ancestors container names from the perspective of this node's children
    const scopeForChildren = scope.maybeAdd(node, variableBeingDefined);
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
    if (newVariableBeingDefined === undefined
        && variableBeingDefined !== undefined
        && passThroughNameBeingAssigned(node)
    ) {
        newVariableBeingDefined = variableBeingDefined;
    }

    // Ignore the preceding operator if this expression starts a new sequence of binary operators
    if (isInterruptInSequenceOfBinaryOperators(node)) {
        mutCtx.precedingOperator = undefined;
        mutCtx.precedingTypeOperator = undefined;
    }

    const ctxForChildren = {
        depth,
        topLevel,
        precedingOperator: mutCtx.precedingOperator,
        scope: scopeForChildren,
        variableBeingDefined: newVariableBeingDefined,
    }

    // Do in order traversal. Expand the left node first. This is so we can have the correct preceding operator.
    const leftChildren = aggregateCostOfChildren(left, ctxForChildren, mutCtx);

    // Score for the current node
    let score = inherentCost(node, scope, mutCtx);
    score += costOfDepth(node, depth);

    if (isBinaryTypeOperator(node)) {
        mutCtx.precedingTypeOperator = node.kind;
    }

    // If this is a binary operator, pass along information about the operator
    if (ts.isBinaryExpression(node)) {
        mutCtx.precedingOperator = node.operatorToken;
    }

    const rightChildren = aggregateCostOfChildren(right, ctxForChildren, mutCtx);

    // The nodes below this node have the same depth number,
    // iff this node is top level and it is a container.
    const depthOfBelow = depth + (topLevel && isContainer(node) ? 0 : 1);

    const ctxForChildrenBelow = {
        ...ctxForChildren,
        depth: depthOfBelow,
        topLevel: false,
    };

    const costOfBelowChildren = aggregateCostOfChildren(below, ctxForChildrenBelow, mutCtx);

    // Ensure the last operator doesn't leak outside of this context
    if (isInterruptInSequenceOfBinaryOperators(node)) {
        mutCtx.precedingOperator = undefined;
        mutCtx.precedingTypeOperator = undefined;
    }

    score += leftChildren.score;
    score += rightChildren.score;
    score += costOfBelowChildren.score;

    const inner = [
        ...leftChildren.inner,
        ...rightChildren.inner,
        ...costOfBelowChildren.inner
    ];

    return { inner, score };
}
