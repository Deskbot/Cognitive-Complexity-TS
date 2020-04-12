import * as ts from "typescript";
import { OutputElem, OutputFileElem } from "./types";

function calcCost(node: ts.Node): OutputElem {
    const inner = [] as OutputElem[];

    let score = 0;
    for (const child of node.getChildren()) {
        const elem = calcCost(child);
        score += elem.score;
        inner.push(elem);
    }

    const { line, character: column } = node.getSourceFile()
        .getLineAndCharacterOfPosition(node.getStart());

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
        const elem = calcCost(child);
        score += elem.score;
        inner.push(elem);
    }

    return {
        inner,
        score,
    }
}
