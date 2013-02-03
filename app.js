require("./qp")(global);

function defaultFn(client) {
    client.text("Hello from app");
    return client.end();
    /*
    client.title("Hello world");
    client.body([
        ["h1", "Hello world"],
        ["p", "test paragraph"]
    ]);
    client.end();
    */
}

qp.route.add("hello", defaultFn);
qp.route.add("typecheck", function(client) {
    qp.dev.typecheck("qp.js");
    client.end();
});
