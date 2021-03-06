require("./qp")(global);

function defaultFn(client) {
    client.style(function(view) {
        return {"body": {"background": "red", "margin": view.height/4}};
    });
    client.jsonml(["div", ["h1", "Hello world"],
        ["p", "test paragraph"]
    ]);
}

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
