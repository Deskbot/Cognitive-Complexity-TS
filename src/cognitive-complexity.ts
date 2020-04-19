import * as ts from "typescript"
import { FileOutput, FunctionOutput } from "./types";
import { sum } from "./util";
import { isFunctionNode, isBreakOrContinueToLabel } from "./node-kind";
import { getChildrenByDepth } from "./depth";

// function for file cost returns FileOutput
export function fileCost(file: ts.SourceFile): FileOutput {
    const childCosts = file.getChildren()
        .map(nodeCost);

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

// some child nodes are at the same depth as this node
// some child nodes are at a depth of 1 greater
// functions declared inside is the concat of:
// all functions declared directly under a non function child node
// all child nodes that are functions
// return score
// return all functions declared inside

// function for node cost (need depth, need node)
function nodeCost(node: ts.Node, depth = 0): { score: number, inner: FunctionOutput[] } {
    const childCosts = node.getChildren()
        .map(nodeCost);

    // include the sum of scores for all child nodes
    let score = childCosts
        .map(cost => cost.score)
        .reduce(sum, 0);

    // TODO write isSequenceOfBinaryOperators to check whether to do an inherent increment
    // BinaryExpressions have 1 child that is the operator
    // BinaryExpressions have their last child as a sub expression
    // can just consume the entire sequence of the same operator
    // then continue traversing from the next different operator in the sequence,
    // which presumably will be given another inherent increment by the next call to calcNodeCost
    // should redundant brackets be ignored? or do they end a sequence?
    // probably the latter, which would also be easier

    // certain langauge features carry and inherent cost
    if (ts.isCatchClause(node)
        || ts.isConditionalExpression(node)
        || ts.isForInStatement(node)
        || ts.isForOfStatement(node)
        || ts.isForStatement(node)
        || ts.isIfStatement(node)
        || ts.isSwitchStatement(node)
        || ts.isWhileStatement(node)
        || isBreakOrContinueToLabel(node)
    ) {
        score += 1;
    }

    // increment for nesting level
    if (depth > 0 && (
        ts.isConditionalExpression(node)
        || ts.isForInStatement(node)
        || ts.isForOfStatement(node)
        || ts.isForStatement(node)
        || ts.isIfStatement(node)
        || ts.isSwitchStatement(node)
        || ts.isWhileStatement(node)
    )) {
        score += depth;
    }

    const [same, below] = getChildrenByDepth(node);

    const inner = [] as FunctionOutput[];

    if (isFunctionNode(node)) {

    } else {

    }

    return {
        inner,
        score,
    };
}