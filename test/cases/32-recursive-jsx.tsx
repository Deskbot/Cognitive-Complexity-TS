function Component() {
    return <RecursiveSelfClosingComponent/>;
}

function RecursiveSelfClosingComponent() {
    return <RecursiveSelfClosingComponent/>;
}

function RecursiveComponent() {
    return <RecursiveComponent></RecursiveComponent>
}
