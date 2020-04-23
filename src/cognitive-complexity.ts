import * as ts from "typescript"
import { FileOutput, FunctionOutput } from "./types";
import { sum } from "./util";
import { isFunctionNode, isBreakOrContinueToLabel, getColumnAndLine, getFunctionNodeName, getClassDeclarationName, getModuleDeclarationName } from "./node-inspection";
import { getChildrenByDepth } from "./depth";

// function for file cost returns FileOutput
export function fileCost(file: ts.SourceFile): FileOutput {
    // TODO can I just call nodeCost(file)
    const childCosts = file.getChildren()
        .map(elem => nodeCost(elem)); // using an arrow so it shows up in call hierarchy

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

function nodeCost(node: ts.Node, depth = 0): { score: number, inner: FunctionOutput[] } {
    let score = 0;

    // TODO write isSequenceOfBinaryOperators to check whether to do an inherent increment
    // BinaryExpressions have 1 child that is the operator
    // BinaryExpressions have their last child as a sub expression
    // can just consume the entire sequence of the same operator
    // then continue traversing from the next different operator in the sequence,
    // which presumably will be given another inherent increment by the next call to calcNodeCost
    // should redundant brackets be ignored? or do they end a sequence?
    // probably the latter, which would also be easier

    // TODO check if ConstructorDeclaration and AccessorDeclaration (get,set) need to be added separately

    // certain langauge features carry and inherent cost
    if (ts.isCatchClause(node)
        || ts.isConditionalExpression(node)
        || ts.isForInStatement(node)
        || ts.isForOfStatement(node)
        || ts.isForStatement(node)
        || ts.isSwitchStatement(node)
        || ts.isWhileStatement(node)
        || isBreakOrContinueToLabel(node)
    ) {
        score += 1;
    }

    // An `if` may contain an else keyword followed by else code.
    // An `else if` is just the else keyword followed by an if statement.
    // Therefore this block is entered for both `if` and `else if`.
    if (ts.isIfStatement(node)) {
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

    // increment for nesting level
    if (depth > 0 && (
        ts.isCatchClause(node)
        || ts.isConditionalExpression(node)
        || ts.isForInStatement(node)
        || ts.isForOfStatement(node)
        || ts.isForStatement(node)
        || ts.isIfStatement(node)
        || ts.isSwitchStatement(node)
        || ts.isWhileStatement(node)
    )) {
        score += depth;
    }

    // TODO use separate functions for score and inner

    // The inner functions of a node is defined as the concat of:
    // * all child nodes that are functions/namespaces/classes
    // * all functions declared directly under a non function child node
    const inner = [] as FunctionOutput[];

    function aggregateScoreAndInnerForChildren(nodesInsideNode: ts.Node[], localDepth: number) {
        for (const child of nodesInsideNode) {
            const childCost = nodeCost(child, localDepth);

            score += childCost.score;

            let name: string;

            // a function/class/namespace is part of the inner scope we want to output
            if (isFunctionNode(child)) {
                name = getFunctionNodeName(child);
            } else if (ts.isClassDeclaration(child)) {
                name = getClassDeclarationName(child);
            } else if (ts.isModuleDeclaration(child)) {
                name = getModuleDeclarationName(child);
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
    const [same, below] = getChildrenByDepth(node, depth);
    aggregateScoreAndInnerForChildren(same, depth);
    aggregateScoreAndInnerForChildren(below, depth + 1);

    return {
        inner,
        score,
    };
}
