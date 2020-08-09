# Necessary Features

* Add a html interface
    * Expand and collapse sections
    * Everything below the top level starts minimised
    * Copy file names on click
    * Copy file name and line and column number on clicking a container name
    * render on expand
    * copy css & html into the build dir rather than trying to ship a specific subset of the source in the package.json
    * Give relative colours to complexities
* When I give several files, they should be grouped by folder in the JSON as if I had only specified the folder and not its contents.
* Should be able to compile and run from a fresh checkout
* Should be able to run when installed as a dependency
* Can I run with npx
* Does global install work
* Update documentation of best way to run it from the terminal
* Add documentation for the json output and the UI output.
* Add documentation on how to use the library programmatically.

# Possible Features

* Gracefully handle incorrect arguments to package.json scripts
* Turn the interface into a single page application, so that pressing back toggles the expansion state
* Choose the TS version used
* recalculate button
    * on a per file basis
    * on a per container basis
* Don't open the ui automatically every time
    * could have it as an option
    * might be possible to open it over an existing one
* Shareable/visitable URLs that link to particular files
    * possibly with a particular expansion state
* VSC Plugin
* Webpack / Rollup Plugin

# Correctness

* Bug: Should increment when a value is recursively referenced but not called.
    * .call .apply etc should count towards recursion because they are referenced
* Bug: Should not be able to recursively reference an object method if the method name is not prepended with 'this".
* Any remaining TODOs should be actioned.

# Code

* is this comment correct: all functions declared directly under a non function child node
* Add comments to the top of each source file to explain the file purpose.
* Make the JavaScript served for the UI to be minimised
* Document utilities.
* Delete unwanted utilities.
* there are a bunch of comments where I should just use the word "container"
* Some comments inside functions could be moved to documentation of the function.

# Technical Debt

* Simplify naming code
