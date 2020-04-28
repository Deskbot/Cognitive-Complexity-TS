/**
 * Purpose: get children of a node organised by their depth.
 */

import * as ts from "typescript";
import { isForLikeStatement, ForLikeStatement, isSyntaxList, isFunctionNode } from "./node-inspection";
import { throwingIterator } from "./util";

type DepthOfChildren = {
    below: ts.Node[],
    same: ts.Node[],
    top?: ts.Node[],
};

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
        return {
            same: node.getChildren(),
            below: []
        };
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
    console.error("arrow", isTopLevel);
    if (isTopLevel) {
        same.push(nextChild());
    } else {
        below.push(nextChild());
    }

    return { same, below };
}

function catchClause(node: ts.CatchClause): DepthOfChildren {
    const children = node.getChildren();

    const variableDefinition = children[2];
    const catchCode = children[4];

    return {
        same: [variableDefinition],
        below: [catchCode]
    };
}

function conditionalExpression(node: ts.ConditionalExpression): DepthOfChildren {
    const children = node.getChildren();

    const condition = children[0];
    const thenCode = children[2];
    const elseCode = children[4];

    return {
        same: [condition],
        below: [thenCode, elseCode]
    };
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

    return { same, below };
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

    return { same, below };
}

function functionDeclaration(node: ts.FunctionDeclaration, isTopLevel: boolean): DepthOfChildren {
    const children = node.getChildren();

    const params = children[3];
    const body = children[children.length - 1];

    if (isTopLevel) {
        return {
            same: [params, body],
            below: []
        };
    } else {
        return {
            same: [params],
            below: [body]
        };
    }
}

function functionExpression(node: ts.FunctionExpression, isTopLevel: boolean): DepthOfChildren {
    const children = node.getChildren();
    const functionBody = children.slice(-1)[0];
    const functionDecl = children.slice(0, -1)[0];

    if (isTopLevel) {
        return {
            same: [functionBody, functionDecl],
            below: []
        };
    } else {
        return {
            same: [functionBody],
            below: [functionDecl]
        };
    }
}

function ifStatement(node: ts.IfStatement): DepthOfChildren {
    const children = node.getChildren();

    const condition = children[2];
    const thenCode = children[4];
    const elseCode = children[6];

    if (elseCode) {
        if (ts.isIfStatement(elseCode)) {
            // an else if structure is on the same depth
            return {
                same: [condition, elseCode],
                below: [thenCode]
            };
        } else {
            // the contents of a solo else are at one depth below
            return {
                same: [condition],
                below: [thenCode, elseCode]
            };
        }
    }

    return {
        same: [condition],
        below: [thenCode]
    };
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

    return { same, below };
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

    return {
        same: condition,
        below: cases
    };
}

function whileStatement(node: ts.WhileStatement): DepthOfChildren {
    const children = node.getChildren();

    const condition = children[2];
    const loopCode = children[4];

    return {
        same: [condition],
        below: [loopCode]
    };
}
