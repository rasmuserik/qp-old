require("./qp")(global);

function defaultFn(client) {
    client.jsonml(["div", ["h1", "Hello world"],
        ["p", "test paragraph"]
    ]);
}

qp.css.add(function(info) {
    return {"body": {"background": "red", margin: info.height/4}};
});
qp.route.add("hello", defaultFn);
qp.route.add(" ", function(client) {
    client.json(client);
});
qp.route.add("typecheck", function(client) {
    qp.dev.typecheck("qp.js");
    client.done();
});

//goog.require("goog.array");
//console.log(goog.array);
