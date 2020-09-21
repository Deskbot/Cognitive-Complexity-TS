import { diff } from "deep-diff";
import { promises as fsP } from "fs";
import * as fs from "fs"
import glob from "glob";
import { js_beautify } from "js-beautify";
import * as path from "path";
import * as process from "process";
import tempfile from "tempfile";
import { toPromise } from "../src/util/util";
import { programOutput } from "../src/api";

const casesDir = path.normalize(__dirname + "/../../test/cases");

main();

function allCaseFilePaths(): Promise<string[]> {
    return toPromise(cb => glob(`${casesDir}/*`, cb));
}

async function getExpectation(fileName: string): Promise<any> {
    const tsIndex = fileName.lastIndexOf(".");
    if (tsIndex !== -1) {
        fileName = fileName.substr(0, tsIndex);
    }
    const caseExpectationFile = fileName + ".expected.json";
    const expectedJsonFile = await fsP.readFile(caseExpectationFile);
    return JSON.parse(expectedJsonFile.toString());
}

async function main() {
    // expected file paths are relative to the case dir
    process.chdir(casesDir);

    // get all case names
    // treat ts files and folders as tests
    let caseFilePaths = (await allCaseFilePaths())
        .filter(path => !path.endsWith(".expected.json"));

    const wantedTests = process.argv.slice(2);
    if (wantedTests.length > 0) {
        caseFilePaths = caseFilePaths
            .filter(path => wantedTests.some(test => path.includes(test)));
    }

    const failedCases = [] as string[];

    // for each case
    for (const caseFilePath of caseFilePaths) {
        const testFileName = path.parse(caseFilePath).name;
        const testName = testFileName.split(".")[0];
        console.log("Testing", testName);

        // run program on case
        // convert output to json
        const outputPath = tempfile();
        try {
            const resultObj = await runCase(caseFilePath, outputPath);
            // read json expected for case
            const expectedObj = await getExpectation(caseFilePath);
            // deep compare the 2
            const difference = diff(expectedObj, resultObj);
            // output the difference
            // print pass or fail
            if (difference && difference.length > 0) {
                throw js_beautify(JSON.stringify(difference));
            } else {
                console.log("Pass");
            }
        } catch (err) {
            console.error("Result", outputPath);
            console.error("Fail");
            console.error(err);
            console.trace();
            failedCases.push(testName);
            continue;
        }
    }

    // list failures
    if (failedCases.length > 0) {
        console.log("All Failures:");
        console.log(failedCases);
    }

    console.log(caseFilePaths.length - failedCases.length, "passed. Out of", caseFilePaths.length);
}

async function runCase(caseFilePath: string, outputPath: string): Promise<string> {
    const result = await programOutput(caseFilePath);

    fs.createWriteStream(outputPath)
        .write(js_beautify(result));

    try {
        return JSON.parse(result);
    } catch (e) {
        throw new Error(`Fail: Could not parse result of ${caseFilePath}. (${outputPath})`);
    }
}
