require("./qp")(global);

function defaultFn(client) {
    client.text("Hello from app");
    return client.done();
    /*
    client.title("Hello world");
    client.body([
        ["h1", "Hello world"],
        ["p", "test paragraph"]
    ]);
    client.done();
    */
}

qp.route.add("hello", defaultFn);
qp.route.add("typecheck", function(client) {
    qp.dev.typecheck("qp.js");
    client.done();
});

//goog.require("goog.array");
//console.log(goog.array);
