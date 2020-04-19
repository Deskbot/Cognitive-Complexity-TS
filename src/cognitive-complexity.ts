import * as ts from "typescript"
import { FileOutput, FunctionOutput } from "./types";
import { sum } from "./util";
import { isFunctionNode, isBreakOrContinueToLabel, getFunctionNodeInfo, getModuleDeclarationInfo } from "./node-inspection";
import { getChildrenByDepth } from "./depth";

// function for file cost returns FileOutput
export function fileCost(file: ts.SourceFile): FileOutput {
    // TODO can I just call nodeCost(file)
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

function nodeCost(node: ts.Node, depth = 0): { score: number, inner: FunctionOutput[] } {
    // include the sum of scores for all child nodes
    let score = 0;

    // inner functions of a node are defined as the concat of:
    // * all functions declared directly under a non function child node
    // * all child nodes that are functions
    const inner = [] as FunctionOutput[];

    function aggregateScoreAndInnerForChildren(nodesInsideNode: ts.Node[], localDepth: number) {
        for (const child of nodesInsideNode) {
            const cost = nodeCost(child, localDepth);
            score += cost.score;

            // TODO do this for classes
            if (isFunctionNode(child)) {
                inner.push({
                    ...getFunctionNodeInfo(child),
                    ...cost,
                });
            } else if (ts.isModuleDeclaration(child)) {
                inner.push({
                    ...getModuleDeclarationInfo(child),
                    ...cost,
                });
            }
        }
    }

    // aggregate score of this node's children
    // and aggregate the inner functions of this node's children
    const [same, below] = getChildrenByDepth(node);
    aggregateScoreAndInnerForChildren(same, depth);
    aggregateScoreAndInnerForChildren(below, depth + 1);

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

    return {
        inner,
        score,
    };
}
