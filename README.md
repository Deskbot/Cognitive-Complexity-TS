This program analyses TypeScript and JavaScript code according to the [Cognitive Complexity metric](https://www.sonarsource.com/docs/CognitiveComplexity.pdf).

Right now it creates a JSON output. In future I expect to add an interactive html output.

## Disclaimer

Myself and this project are completely unaffiliated with Sonar Source.

## Install

```
npm install cognitive-complexity-ts
```

## Run

```
npx cognitive-complexity-ts [file path]
```

## Simple Overview of the Cognitive Complexity Metric

Each function, class, namespace, type, and file has a complexity score based on the total complexity of all code written inside. The complexity score is not increased by code that is referenced.

### Inherent Cost

The following structures increase the complexity score by 1.

* `if`, `else`, `else if`, `? :` for types and data
* `switch`
* `for`, `while`, `do while`
* `catch`
* `break label`, `continue label`
* a sequence of the same operator `&&`, `||`, `??`, intersection `&`, union `|`
* a recursive reference to a function, class, or type
* mapped type `{ [K in T]: ... }`

### Nesting Increments

The following structures increase the complexity score by a number equal to the depth the code is at. The depth of code is defined in the next section.

* `if`, `? :` for types and data
* `switch`
* `for`, `while`, `do while`
* `catch`
* mapped type `{ [K in T]: ... }`

The following structures increment the depth by 1.

* code called when the condition is met in `if` and `else if`
* `else`
* conditionally executed code in a conditional expression `? ... : ...`
* `switch`
* looped code in `for`, `while`, `do while`
* `catch`
* nested function body, nested class body

## Differences

I have taken some liberties with the guidelines set out by Sonar Source in the Cognitive Complexity whitepaper in order to account for TypeScript's features and to improve the user output.

Changes:

* Classes have a score
* Files have a score
* Namespaces have a score
* Types have a score
    * Union and intersection have an inherent increment
    * Mapped types have an inherent and nesting increments
    * Recursive types have an inherent increment
* Recursive references have an increment, not just recursive calls

## Output

Some anonymous classes and functions will appear with names because they are assigned to a variable/const.

## Development Tools

### Test

```
npm run test [test name]
```

The test name can be any substring of a path to a test file. Or the test name can be left blank to run all tests.

### TypeScript Parser Output

Microsoft doesn't appear to have documentation for what all of the AST nodes are, so I created a tool to output the AST for the code.

```
npm run what [file path]
```

## License

I haven't decided yet.
