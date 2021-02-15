# UI

Why is it written like this?

I want the value of componentised web development without a heavy framework. The UI is not so complicated that it requires html to change once written. The style does need to be slightly dynamic, which can be accomplished through the simple traditional DOM API.

Although frameworks allow for declarative code that is very short and readable, without transpilation it is inherently inefficient and would require the use of libraries with large memory footprints and speed-limiting virtual-DOM.

* Responsiveness of user-interfaces matters to users.
* RAM is valuable and programmers use a lot of it. A tool to help developers shouldn't take too much of it.

I am experimenting with ways of writing simple, well-organised, performant web UI code. I think it is important for this project because people may wish to look at an entire project at once.

I'm not entirely happy with certain aspects of this code, but it has been a learning experience. A lot of this turned out rather ad-hoc instead of like a framework, but I know how I would like things to look; the time that would be required to get to that point isn't worth it.

## Guiding Principles

* In reality UI is mutable and simple changes are simple to do in modern JavaScript.
* Components can be functional or stateful. Following the well-established principles of keeping components small and simple, means stateful components should not be too difficult to manage.
* Each stateful component should expose a single DOM element that has any number of children. Components can not change the DOM of another component, except by parenting their exposed DOM, or by adding a class to the exposed DOM that only affects its positioning (e.g. flex attributes). This allows the DOM of a component to be slotted in and out of the page, while not interfering with its internal behaviour and state.
    * Note that document fragments can not be exposed by components because attaching the fragment to the dom re-parents the fragment's children.
    * Functional components can return arrays of components or DOM.
* Components should be agnostic about their positioning. A component's creator should choose its position in the page if any.
    * Flex CSS properties rely on groups of elements having properties that work together in specific ways. It makes much more sense for an element that has a `display` of `flex` or `inline-flex` to enforce the flex properties of its children than to give components general rules about how they should be sized if they happen to be put in a flex container.
* Other CSS for a component should be discoverable from the component code. This is achieved with lazy CSS imports being added when a component module is loaded.
* Stateful components should be rendered on construction to ensure that they are rendered correctly with all usages. Each method that alters the state of a component should also trigger a re-render. Although it should be avoided, it is ok for multiple re-renders to take place where a single one could be achieved and would be more efficient, if the code is still performant.
