/**
 * Purpose: get children of a node organised by their depth.
 */

import * as ts from "typescript";
import { isForLikeStatement, ForLikeStatement, isSyntaxList, isFunctionNode } from "./node-inspection";
import { throwingIterator } from "./util";

type DepthOfChildren = [ts.Node[], ts.Node[]];

/**
 * @param node The node whose children to categorise by depth
 * @returns a tuple of [children and the same depth, children at one level below]
 */
export function getChildrenByDepth(node: ts.Node, depth: number): DepthOfChildren {
    if (ts.isArrowFunction(node)) {
        return arrowFunction(node, depth === 0);
    } else if (ts.isCatchClause(node)) {
        return catchClause(node);
    } else if (ts.isConditionalExpression(node)) {
        return conditionalExpression(node);
    } else if (ts.isDoStatement(node)) {
        return doStatement(node);
    } else if (isForLikeStatement(node)) {
        return forLikeStatement(node);
    } else if (ts.isFunctionDeclaration(node)) {
        return functionDeclaration(node, depth === 0);
    } else if (ts.isFunctionExpression(node)) {
        return functionExpression(node, depth === 0);
    } else if (ts.isIfStatement(node)) {
        return ifStatement(node);
    } else if (ts.isMethodDeclaration(node)) {
        return methodDeclaration(node, depth === 0);
    } else if (ts.isSwitchStatement(node)) {
        return switchStatement(node);
    } else if (ts.isWhileStatement(node)) {
        return whileStatement(node);
    } else {
        return [node.getChildren(), []];
    }
}

function arrowFunction(node: ts.ArrowFunction, isTopLevel: boolean): DepthOfChildren {
    const same = [] as ts.Node[];
    const below = [] as ts.Node[];

    const nextChild = throwingIterator(node.getChildren().values());

    // consume OpenParenToken
    nextChild();
    // aggregate code inside SyntaxList
    same.push(nextChild());
    // consume CloseParenToken
    nextChild();
    // consume EqualsGreaterThanToken
    nextChild();
    // aggregate code inside arrow function
    if (isTopLevel) {
        same.push(nextChild());
    } else {
        below.push(nextChild());
    }

    return [same, below];
}

function catchClause(node: ts.CatchClause): DepthOfChildren {
    const children = node.getChildren();

    const variableDefintion = children[2];
    const catchCode = children[4];

    return [[variableDefintion], [catchCode]];
}

function conditionalExpression(node: ts.ConditionalExpression): DepthOfChildren {
    const same = [] as ts.Node[];
    const below = [] as ts.Node[];

    let childNodesToAggregate = [] as ts.Node[];

    for (const child of node.getChildren()) {
        if (ts.isToken(child) && child.kind === ts.SyntaxKind.QuestionToken) {
            // aggregate condition
            same.push(...childNodesToAggregate);
            childNodesToAggregate = [];

        } else if (ts.isToken(child) && child.kind === ts.SyntaxKind.ColonToken) {
            // aggregate then
            below.push(...childNodesToAggregate);
            childNodesToAggregate = [];

        } else {
            childNodesToAggregate.push(child);
        }
    }

    // aggregate else
    below.push(node);

    return [same, below];
}

function doStatement(node: ts.DoStatement): DepthOfChildren {
    const same = [] as ts.Node[];
    const below = [] as ts.Node[];

    const nextChild = throwingIterator(node.getChildren().values());

    // consume do token
    nextChild();
    // aggregate block
    below.push(nextChild());
    // consume while keyword
    nextChild();
    // consume open paren
    nextChild();
    // aggregate condition
    same.push(nextChild());

    return [same, below];
}

function forLikeStatement(node: ForLikeStatement): DepthOfChildren {
    const same = [] as ts.Node[];
    const below = [] as ts.Node[];

    const nextChild = throwingIterator(node.getChildren().values());

    // consume for keyword
    nextChild();
    // consume open parenthesis
    nextChild();

    // consume everything up to the close parenthesis
    while (true) {
        const child = nextChild();
        if (ts.isToken(child) && child.kind === ts.SyntaxKind.CloseParenToken) {
            break;
        }

        same.push(child);
    }

    // consume looped code
    below.push(nextChild());

    return [same, below];
}

function functionDeclaration(node: ts.FunctionDeclaration, isTopLevel: boolean): DepthOfChildren {
    const children = node.getChildren();

    const params = children[3];
    const body = children[children.length - 1];

    if (isTopLevel) {
        return [[params, body], []];
    } else {
        return [[params], [body]];
    }
}

function functionExpression(node: ts.FunctionExpression, isTopLevel: boolean): DepthOfChildren {
    const children = node.getChildren();
    const functionBody = children.slice(-1);
    const functionDecl = children.slice(0, -1)[0];

    if (isTopLevel) {
        [[...functionBody, functionDecl], []];
    }

    return [functionBody, [functionDecl]];
}

function ifStatement(node: ts.IfStatement): DepthOfChildren {
    const children = node.getChildren();

    const condition = children[2];
    const thenCode = children[4];
    const elseCode = children[6];

    if (elseCode) {
        if (ts.isIfStatement(elseCode)) {
            // an else if structure is on the same depth
            return [[condition, elseCode], [thenCode]];
        } else {
            // the contents of a solo else are at one depth below
            return [[condition], [thenCode, elseCode]];
        }
    }

    return [[condition], [thenCode]];
}

function methodDeclaration(node: ts.MethodDeclaration, isTopLevel: boolean): DepthOfChildren {
    const same = [] as ts.Node[];
    const below = [] as ts.Node[];

    const nextChild = throwingIterator(node.getChildren().values());

    while (true) {
        const child = nextChild();
        if (ts.isBlock(child)) {
            if (isTopLevel) {
                same.push(child);
            } else {
                below.push(child);
            }
            break;
        }

        same.push(child);
    }

    return [same, below];
}

function switchStatement(node: ts.SwitchStatement): DepthOfChildren {
    const nextChild = throwingIterator(node.getChildren().values());

    // consume switch keyword
    nextChild();
    // consume open parenthesis
    nextChild();
    // aggregate condition
    const condition = [nextChild()];
    // consume close parenthesis
    nextChild();
    // consume cases
    const cases = [nextChild()];

    return [condition, cases];
}

function whileStatement(node: ts.WhileStatement): DepthOfChildren {
    const children = node.getChildren();

    const condition = children[2];
    const loopCode = children[4];

    return [[condition], [loopCode]];
}
