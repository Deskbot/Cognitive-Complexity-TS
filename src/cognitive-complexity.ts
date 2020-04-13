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
        name: node.getText(), // todo make this match the function etc
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

    depth += incrementNestingLevel(node) ? 1 : 0;

    if (ts.isIfStatement(node)) {
        result = calcNodeCost(node.thenStatement, depth + 1);
        score += result.score;
        inner.push(...result.inner);

        if (node.elseStatement) {
            result = calcNodeCost(node.elseStatement, depth + 1);
            score += result.score;
            inner.push(...result.inner);
        }
    }

    return {
        score,
        inner,
    };
}

function incrementNestingLevel(node: ts.Node): boolean {
    if (ts.isIfStatement(node)) {
        node.thenStatement
        node.elseStatement
    }

    return false;
}
