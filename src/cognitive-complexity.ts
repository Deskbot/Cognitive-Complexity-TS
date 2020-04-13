import * as ts from "typescript";
import { OutputElem, OutputFileElem } from "./types";

interface ScoreAndInner {
    inner: OutputElem[];
    score: number;
}

function calcElemCost(node: ts.Node, depth = 0): OutputElem {
    const inner = [] as OutputElem[];

    let score = 0;
    for (const child of node.getChildren()) {
        const elem = calcElemCost(child);
        score += elem.score;
        inner.push(elem);
    }

    const { line, character: column } = node.getSourceFile()
        .getLineAndCharacterOfPosition(node.getStart());

    const nodeCost = calcNodeCost(node, depth);
    score += nodeCost.score;
    inner.push(...nodeCost.inner);

    return {
        name: node.getFullText(), // todo make this match the function etc
        score,
        line,
        column,
        inner,
    }
}

export function calcFileCost(file: ts.Node): OutputFileElem {
    const inner = [] as OutputElem[];

    let score = 0;
    for (const child of file.getChildren()) {
        const elem = calcElemCost(child);
        score += elem.score;
        inner.push(elem);
    }

    return {
        inner,
        score,
    }
}

function calcNodeCost(node: ts.Node, depth: number): ScoreAndInner {
    let score = 0;
    let inner = [] as OutputElem[];
    let result: ScoreAndInner;

    // increment depth for certain structures
    if (ts.isIfStatement(node)
        || ts.isSwitchStatement(node)
        || ts.isForStatement(node)
        || ts.isForInStatement(node)
        || ts.isForOfStatement(node)
        || ts.isWhileStatement(node)
        || ts.isDoStatement(node)
        || ts.isCatchClause(node)
        || (
            depth !== 0
            && (
                ts.isArrowFunction(node)
                || ts.isFunctionDeclaration(node)
                || ts.isFunctionExpression(node)
                || ts.isMethodDeclaration(node)
            )
        )
    ) {
        depth += 1;
    }

    for (const child of node.getChildren()) {
        result = calcNodeCost(child, depth);
        score += result.score;
        inner.push(...result.inner);
    }

    return {
        score,
        inner,
    };
}
