import * as ts from "typescript";
import { debuglog } from "util";

const mainDebug = debuglog("main");

export function debugNode(child: ts.Node) {
    if (process.env.DEBUG) {
        mainDebug(child.getFullText());
    }
}
