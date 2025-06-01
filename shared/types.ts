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
     */
    precedingOperator: ts.BinaryOperatorToken | undefined;

    /**
     * In a sequence of type operators, which operator are we continuing on from.
     * During in order traversal, this value will be set by one child node and read by an adjacent child.
     */
    precedingTypeOperator: ts.SyntaxKind.AmpersandToken | ts.SyntaxKind.BarToken | undefined;

    /**
     * Keeps track of how many levels deep into a binary type operator tree we are.
     */
    typeOperatorSemaphore: number;
}
