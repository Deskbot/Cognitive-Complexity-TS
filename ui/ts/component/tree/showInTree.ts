export function showInTree(elem: Element, depth: number) {
    const targetTopPos = 39 * (depth - 1);

    // if top of elem is above the target position, scroll it down.
    const rect = elem.getBoundingClientRect();
    if (rect.top < targetTopPos) {

        // put the top of the element at the top of the screen
        elem.scrollIntoView(true);

        // scroll the window down to put the element at its target position
        window.scrollBy(0, -39 * (depth - 1));
    }
}
