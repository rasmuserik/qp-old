if (typeof qp === "undefined") {
    qp = require("./qp");
}

function defaultFn(client) {
    client.text("Hello from app");
    return client.end();
    client.title("Hello world");
    client.body([
        ["h1", "Hello world"],
        ["p", "test paragraph"]
    ]);
    client.end();
}

qp.register({ path: "", fn: defaultFn});
qp.register({ path: "index", fn: defaultFn});
qp.scope({platform: "http"}).register({ path: "app", fn: defaultFn});
