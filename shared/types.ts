import ts from "typescript";
import { Scope } from "../src/cognitive-complexity/Scope";

export interface ColumnAndLine {
    column: number;
    line: number;
}

export interface FunctionNodeInfo extends ColumnAndLine {
    name: string;
}

export interface ContainerOutput extends FunctionNodeInfo {
    score: number;
    inner: ContainerOutput[];
}

export interface FileOutput {
    score: number;
    inner: ContainerOutput[];
}

export type FolderOutput = {
    [name: string]: FileOutput | FolderOutput;
};

export type ProgramOutput = FolderOutput;

export interface ScoreAndInner {
    score: number;
    inner: ContainerOutput[];
}

export interface TraversalContext {
    /**
     * Whether the node is at the top level of a file
     */
    readonly topLevel: boolean;
    /**
     * The depth the node is at
     */
    readonly depth: number;
    /**
     * Information about scope where the node exists in the code
     */
    readonly scope: Scope;
    /**
     * If the node is part of a variable being introduced, what is the name of that variable.
     */
    readonly variableBeingDefined: string | undefined;
}

export interface MutableTraversalContext {
    /**
     * In a sequence of binary operators, which operator are we continuing on from.
     * During in order traversal, this value will be set by one child node and read by an adjacent child.
     *
     * A binary operator node has 2 children, one for each operand.
     * We do in order traversal, keeping track of the binary operator node (not the operator token).
     *
     * A && B && C || D
     *
     *              ||
     *         &&        D
     *      &&    C
     *     A  B
     */
    precedingOperator: ts.BinaryOperatorToken | undefined;

    /**
     * In a sequence of type operators, which operator are we continuing on from.
     * During in order traversal, this value will be set by one child node and read by an adjacent child.
     *
     * A type operator node can have many children all joined with the same operator.
     * We do in order traversal, keeping track of the type operator token (not the type node).
     *
     * A & B & C | D
     *
     *               |
     *            &     D
     *          A B C
     *
     * We can't track the operator node itself
     * because there is always a SyntaxList node between the operator node and the operands.
     * We can't easily change the latest operator based on the UnionType node, after evaluating the first operand.
     * UnionType
     *   SyntaxList
     *     LiteralType
     *     BarToken
     *     LiteralType
     */
    precedingTypeOperator: ts.SyntaxKind.AmpersandToken | ts.SyntaxKind.BarToken | undefined;
}
