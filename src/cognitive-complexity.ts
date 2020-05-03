import * as ts from "typescript"
import { FileOutput, FunctionOutput, ScoreAndInner } from "./types";
import { sum, countNotAtTheEnds } from "./util";
import { isFunctionNode, isBreakOrContinueToLabel, getColumnAndLine, getFunctionNodeName, getClassDeclarationName, getModuleDeclarationName, getCalledFunctionName, getDeclarationName, isNamedDeclarationOfContainer, isSequenceOfDifferentBooleanOperations, getTypeAliasName, isBinaryTypeOperator, report, isContainer } from "./node-inspection";
import { whereAreChildren } from "./depth";

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

function nodeCost(
    node: ts.Node,
    topLevel: boolean,
    depth = 0,
    namedAncestors = [] as ReadonlyArray<string>,
): ScoreAndInner {
    let score = 0;

    // TODO check if ConstructorDeclaration and AccessorDeclaration (get,set) need to be added separately

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
        score += 1;
    } else if (ts.isCallExpression(node)) {
        const calledFunctionName = getCalledFunctionName(node);
        for (const name of namedAncestors) {
            if (name === calledFunctionName) {
                score += 1;
                break;
            }
        }
    }

    // An `if` may contain an else keyword followed by else code.
    // An `else if` is just the else keyword followed by an if statement.
    // Therefore this block is entered for both `if` and `else if`.
    else if (ts.isIfStatement(node)) {
        // increment for `if` and `else if`
        score += 1;

        // increment for solo else
        const children = node.getChildren();
        const elseIndex = children.findIndex(child => child.kind === ts.SyntaxKind.ElseKeyword);
        if (elseIndex !== -1) {
            const elseIf = ts.isIfStatement(children[elseIndex + 1]);
            if (!elseIf) {
                score += 1;
            }
        }
    }

    else if (isBinaryTypeOperator(node)) {
        // This node naturally represents a sequence of binary type operators.
        // (unlike normal binary operators)
        score += 1;

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
    }

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
            score += depth;
        }
    }

    // TODO use separate functions for score and inner

    // The inner functions of a node is defined as the concat of:
    // * all child nodes that are functions/namespaces/classes
    // * all functions declared directly under a non function child node
    const inner = [] as FunctionOutput[];

    // get the ancestors function names from the perspective of this node's children
    const namedAncestorsOfChildren = maybeAddNodeToNamedAncestors(node, namedAncestors);

    function aggregateScoreAndInnerForChildren(nodesInsideNode: ts.Node[], localDepth: number, topLevel: boolean) {
        for (const child of nodesInsideNode) {
            const childCost = nodeCost(child, topLevel, localDepth, namedAncestorsOfChildren);

            score += childCost.score;

            let name: string;

            // a function/class/namespace is part of the inner scope we want to output
            if (isFunctionNode(child)) {
                const variableBeingDefined = namedAncestorsOfChildren[namedAncestorsOfChildren.length - 1];
                name = getFunctionNodeName(child, variableBeingDefined);
            } else if (ts.isClassDeclaration(child)) {
                name = getClassDeclarationName(child);
            } else if (ts.isModuleDeclaration(child)) {
                name = getModuleDeclarationName(child);
            } else if (ts.isTypeAliasDeclaration(child)) {
                name = getTypeAliasName(child);
            } else {
                // the child's inner is all part of this node's direct inner scope
                inner.push(...childCost.inner);
                continue;
            }

            inner.push({
                ...getColumnAndLine(child),
                ...childCost,
                name,
            });
        }
    }

    // Aggregate score of this node's children.
    // Aggregate the inner functions of this node's children.
    const { same, below } = whereAreChildren(node);

    aggregateScoreAndInnerForChildren(same, depth, topLevel);
    // todo can I pass the information needed here into whereAreChildren
    const container = isContainer(node);
    const depthOfBelow = depth + (topLevel && container ? 0 : 1);
    aggregateScoreAndInnerForChildren(below, depthOfBelow, false);

    return {
        inner,
        score,
    };
}

export function maybeAddNodeToNamedAncestors(
    node: ts.Node,
    ancestorsOfNode: ReadonlyArray<string>
): ReadonlyArray<string> {
    if (isNamedDeclarationOfContainer(node)) {
        return [...ancestorsOfNode, getDeclarationName(node)];
    }

    if (ts.isTypeAliasDeclaration(node)) {
        return [...ancestorsOfNode, getTypeAliasName(node)];
    }

    if (isFunctionNode(node)) {
        const nodeNameIfCallable = getFunctionNodeName(node);

        if (nodeNameIfCallable !== undefined && nodeNameIfCallable.length !== 0) {
            return [...ancestorsOfNode, nodeNameIfCallable];
        }
    }

    return ancestorsOfNode;
}
