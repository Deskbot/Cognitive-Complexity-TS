import jasmine from "jasmine";
import path from "path";
import ts from "typescript";

import { getFunctions } from "../../src/get-functions";

describe("getting functions from TypeScript source", () => {
    it("should find no functions in an empty file", () => {
        const file = ts.createSourceFile(
            path.basename(__dirname + "./cases/empty.ts"),
            "./cases/empty.ts",
            ts.ScriptTarget.ES2017,
            true,
        );

        expect(getFunctions(file).length).toBe(0);
    });

    it("fail", () => {
        fail();
    });
});
