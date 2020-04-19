import * as ts from "typescript"
import { FileOutput, FunctionOutput } from "./types";
import { sum } from "./util";
import { isFunctionNode, isBreakOrContinueToLabel, getColumnAndLine, getFunctionNodeName, getClassDeclarationName, getModuleDeclarationName } from "./node-inspection";
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
    let score = 0;

    // The inner functions of a node is defined as the concat of:
    // * all child nodes that are functions/namespaces/classes
    // * all functions declared directly under a non function child node
    const inner = [] as FunctionOutput[];

    function aggregateScoreAndInnerForChildren(nodesInsideNode: ts.Node[], localDepth: number) {
        for (const child of nodesInsideNode) {
            const childCost = nodeCost(child, localDepth);

            let name: string;
            let addInner = true;

            if (isFunctionNode(child)) {
                name = getFunctionNodeName(child);
            } else if (ts.isClassDeclaration(child)) {
                name = getClassDeclarationName(child);
            } else if (ts.isModuleDeclaration(child)) {
                name = getModuleDeclarationName(child);
            } else {
                // not a function/class/namespace ∴ it's not an inner scope we want to output
                addInner = false;
                name = ""; // make TypeScript happy by ensuring this is assigned
            }

            if (addInner) {
                inner.push({
                    ...getColumnAndLine(child),
                    ...childCost,
                    name,
                });
            }

            score += childCost.score;
        }
    }

    // Aggregate score of this node's children.
    // Aggregate the inner functions of this node's children.
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
