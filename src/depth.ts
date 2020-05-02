/**
 * Purpose: get children of a node organised by their depth.
 */

import * as ts from "typescript";
import { isForLikeStatement, ForLikeStatement, isBinaryTypeOperator } from "./node-inspection";
import { throwingIterator } from "./util";

interface DepthOfChildren {
    /**
     * The same level of depth.
     */
    same: ts.Node[];

    /**
     * One level of depth below.
     */
    below: ts.Node[];
};

/**
 * @param node The node whose children to categorise by depth
 * @returns a tuple of [children and the same depth, children at one level below]
 */
export function whereAreChildren(node: ts.Node): DepthOfChildren {
    if (ts.isArrowFunction(node)) {
        return arrowFunction(node);
    } else if (ts.isCatchClause(node)) {
        return catchClause(node);
    } else if (ts.isConditionalExpression(node)) {
        return conditionalExpression(node);
    } else if (ts.isConditionalTypeNode(node)) {
        return conditionalType(node);
    } else if (ts.isDoStatement(node)) {
        return doStatement(node);
    } else if (isForLikeStatement(node)) {
        return forLikeStatement(node);
    } else if (ts.isFunctionDeclaration(node)) {
        return functionDeclaration(node);
    } else if (ts.isFunctionExpression(node)) {
        return functionExpression(node);
    } else if (ts.isIfStatement(node)) {
        return ifStatement(node);
    } else if (ts.isMethodDeclaration(node)) {
        return methodDeclaration(node);
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

// todo simplify
function arrowFunction(node: ts.ArrowFunction): DepthOfChildren {
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
    below.push(nextChild());

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

function conditionalType(node: ts.ConditionalTypeNode): DepthOfChildren {
    const children = node.getChildren();

    const endOfCondition = children
        .findIndex(child => child.kind === ts.SyntaxKind.QuestionToken);
    const endOfThen = children
        .findIndex(child => child.kind === ts.SyntaxKind.ColonToken);

    console.error(children.map(child => child.getText()))
    console.error(children.map(child => ts.SyntaxKind[child.kind]))
    const condition = children.slice(0, endOfCondition);
    // then code
    const below = children.slice(endOfCondition + 1, endOfThen);
    // else code
    below.push(...children.slice(endOfThen + 1));

    console.error(condition.map(child => ts.SyntaxKind[child.kind]))
    console.error(below.map(child => ts.SyntaxKind[child.kind]))

    return {
        same: condition,
        below,
    };
}

// todo simplify
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

// todo simplify
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

function functionDeclaration(node: ts.FunctionDeclaration): DepthOfChildren {
    const children = node.getChildren();

    const params = children[3];
    const body = children[children.length - 1];

    return {
        same: [params],
        below: [body]
    };
}

function functionExpression(node: ts.FunctionExpression): DepthOfChildren {
    const children = node.getChildren();
    const functionBody = children.slice(-1)[0];
    const functionDecl = children.slice(0, -1)[0];

    return {
        same: [functionBody],
        below: [functionDecl]
    };
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

// todo simplify
function methodDeclaration(node: ts.MethodDeclaration): DepthOfChildren {
    const same = [] as ts.Node[];
    const below = [] as ts.Node[];

    const nextChild = throwingIterator(node.getChildren().values());

    while (true) {
        const child = nextChild();
        if (ts.isBlock(child)) {
            below.push(child);
            break;
        }

        same.push(child);
    }

    return { same, below };
}

// todo simplify
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
