if (typeof qp === "undefined") {
    qp = require("./qp");
}

function defaultFn(client) {
    client.title("Hello world");
    client.body([
        ["h1", "Hello world"],
        ["p", "test paragraph"]
    ]);
    client.end();
}

qp.register("demoapp", {
    version: "0.0.1",
    routes: {
        "index": defaultFn,
        "": defaultFn
    }
});
