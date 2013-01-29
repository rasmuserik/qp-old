if (typeof qp === "undefined") {
    qp = require("./qp");
};

function defaultFn(req, res) {
    res.title("Hello world");
    res.body([["h1", "Hello world"], ["p", "test paragraph"]]);
    res.end();
}

qp.register({
    name: "demoapp",
    version: "0.0.1",
    routes: {
        "index": defaultFn,
        "": defaultFn
    }
});
