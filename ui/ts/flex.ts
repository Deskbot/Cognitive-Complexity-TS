import { addStyleSheet, Component } from "./framework";

addStyleSheet(import.meta.url);

export function flexGrow<C extends Component>(component: C): C {
    component.dom.classList.add("flex-grow");
    return component;
}

export function flexNone<C extends Component>(component: C): C {
    component.dom.classList.add("flex-none");
    return component;
}
