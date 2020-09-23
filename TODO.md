# Correctness

* Bug: Should increment when a value is recursively referenced but not called.
    * .call .apply etc should count towards recursion because they are referenced
* Bug: Should not be able to recursively reference an object method if the method name is not prepended with 'this".
* Any remaining TODO comments should be actioned.

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

* is this comment correct: all functions declared directly under a non function child node
* Add comments to the top of each source file to explain the file purpose.
* Make the JavaScript served for the UI to be minimised
* Document utilities.
* Delete unwanted utilities.
* there are a bunch of comments where I should just use the word "container"
* Some comments inside functions could be moved to documentation of the function.

# Performance

* Should script imports become attached tags to shadow DOM?

# Technical Debt

* Simplify naming code
