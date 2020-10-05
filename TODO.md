# Correctness

* Bug: Should increment when a value is recursively referenced but not called.
    * .call .apply etc should count towards recursion because they are referenced

# Possible Features

* Gracefully handle incorrect arguments to package.json scripts
* json and ui commands handle input differently
    * give json a help text
    * let json take multiple files
* see full path somehow without it getting the way or being inconsistent
* Option to hide anything with a score of 0.
    * on the json command level, not the ui level
* filter out types of nodes in the UI tree
    * everything
    * no folders
    * no folders or files
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

* Should script imports become attached tags to shadow DOM?
* Make the JavaScript served for the UI to be minimised

# Technical Debt

* Simplify naming code
