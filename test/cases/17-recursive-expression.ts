const i = () => {
    i();
};

const j = () => {
    j();
    j();
};

const k = () => {
    i();
};

const l = function() {
    l();
};

const m = function() {
    m();
    m();
};

const n = function() {
    i();
};

() => {
    i();
};

const o = function p() {
    const poop = 1;
    i();
    o();
    p();
};
