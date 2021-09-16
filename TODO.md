# Correctness

* Bug: Should increment when a value is recursively referenced but not called.
    * .call .apply etc should count towards recursion because they are referenced

# User Experience

* Gracefully handle incorrect arguments to package.json scripts
    * Require a path to be specified
* When the UI server is running, prevent errors about source map files not being found.

# Possible Features

* Don't include empty folders and files in the output.
* show/hide 0 complexity
* icons to show whether something is a file or folder
* show/hide anonymous functions
* json and ui commands handle input differently
    * give json a help text
    * let json take multiple files
* Option to hide anything with a score of 0.
    * on the json command level, not the ui level
* Choose the TS version used
* Give relative colours to complexities
* recalculate button
    * on a per file basis
    * on a per container basis
* Turn the interface into a single page application, so that pressing back toggles the expansion state
* Improve the nodejs api to allow more input methods:
    * give a string/stream of ts code
    * give a ts node object
* When something unreachable is reached, print the path to the file where the node is, instead of just the file name.
* Import/Export json in browser
    * or import on the command line
* Don't open the ui automatically every time
    * could have it as an option
    * might be possible to open it over an existing one
* Shareable/visitable URLs that link to particular files
    * possibly with a particular expansion state
* VSC Plugin
* Webpack / Rollup Plugin

# Code

* Add comments to the top of each source file to explain the file purpose.
* cognitive-complexity.ts has some functions with many arguments. namedAncestors and variableAlreadyBeingDefined run the same code to generate themselves, this could be simplified, perhaps wrapped in a class. There are several functions that use a subset of the information defined in nodeCost. NodeCost is almost like a class constructor. Could consider splitting that function if it's unappealing to turn it into a class.
* Document utilities.
* Delete unwanted utilities.
* there are a bunch of comments where I should just use the word "container"
* Some comments inside functions could be moved to documentation of the function.

# Performance

* Do I need "folder concepts" distinct from folders?
    * It helps that the top-most level is just folder contents for displaying adjacent files/containers.
* Should script imports become attached tags to shadow DOM?
* Make the JavaScript served for the UI to be minimised

# Technical Debt

* Simplify naming code
