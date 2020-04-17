import * as ts from "typescript";
import { debuglog } from "util";

export const testLog = debuglog("test");

export function logNode(child: ts.Node) {
    testLog(child.getFullText());
}
