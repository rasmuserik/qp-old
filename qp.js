/*jshint sub:true*/
/*global qp process setTimeout location require console window localStorage document module __dirname __filename*/
var qp = {};
(function() {
    "use strict";
    // setup {{{
    if (typeof module !== "undefined") {
        module["exports"] = qp;
    }
    //}}}
    // environment {{{
    qp.nodejs = typeof PLATFORM_NODEJS !== "undefined" ? PLATFORM_NODEJS : typeof process !== "undefined";
    qp.html5 = typeof PLATFORM_HTML5 !== "undefined" ? PLATFORM_HTML5 : !qp.nodejs;
    qp.host = "localhost";
    qp.port = 1234;
    // }}}
    // util {{{
    qp.trycatch = function(fn1, fn2) { //{{{
        try {
            return fn1();
        } catch (e) {
            return fn2(e);
        }
    }; //}}}
    qp.extend = function(target) { //{{{
        for (var i = 1; i < arguments.length; ++i) {
            var obj = arguments[i];
            for (var key in obj) {
                target[key] = obj[key];
            }
        }
        return target;
    }; //}}}
    qp.listpp = function(list, indent) { //{{{
        indent = indent || "  ";
        if (typeof list === "string") {
            return list;
        }
        var result = list.map(function(elem) {
            return qp.listpp(elem, indent + "  ");
        });
        var len = 0;
        result.forEach(function(elem) {
            len += elem.length + 1;
        });
        if (len < 72) {
            return "[" + result.join(" ") + "]";
        } else {
            return "[" + result.join("\n" + indent) + "]";
        }
    }; //}}}
    qp.list2obj = function(arr) { // {{{
        var result = {};
        arr.forEach(function(elem) {
            result[elem] = true;
        });
        return result;
    }; //}}}
    qp.uniqId = function(prefix) { //{{{
        prefix = prefix || "_";
        ++uniqIdCounter;
        return prefix + String(uniqIdCounter);
    };
    var uniqIdCounter = 0; // }}}
    qp.nextTick = function(fn) { //{{{
        if (qp.nodejs) {
            process["nextTick"](fn);
        } else {
            setTimeout(fn, 0);
        }
    }; //}}}
    function arrayToSetObject(arr) { //{{{
        var i;
        var result = {};
        for (i = 0; i < arr.length; ++i) {
            result[arr[i]] = true;
        }
        return result;
    } //}}}
    function notEmpty(obj) { //{{{
        return Object.keys(obj).length !== 0;
    } //}}}
    function urlUnescape(str) { //{{{
        return str.replace(/\+/g, " ").replace(/%[0-9a-fA-F][0-9a-fA-F]/g, function(code) {
            return String.fromCharCode(parseInt(code.slice(1), 16));
        });
    } //}}}
    qp.throttledFn = function(fn, delay) { //{{{
        delay = delay || 5000;
        var lastRun = 0;
        var scheduled = false;
        var callbacks = [];
        return function(callback) {
            if (callback) {
                callbacks.push(callback);
            }
            if (scheduled) {
                return;
            }
            var self = this;
            var run = function() {
                scheduled = false;
                callbacks = [];
                lastRun = Date.now();
                fn.call(self, function() {
                    callbacks.forEach(function(f) {
                        f();
                    });
                });
            };
            scheduled = true;
            setTimeout(run, Math.max(0, delay - (Date.now() - lastRun)));
        };
    }; //}}}
    qp.asyncArrayForEach = function(arr, fn, done) { //{{{
        var count = arr.length;
        var cb = function() {
            if (count === 0) {
                done();
            }--count;
        };
        cb();
        arr.forEach(function(key) {
            fn(key, cb);
        });
    }; //}}}
    qp.name2url = function(name) { //{{{
        return (String(name)).replace(new RegExp("[^a-zA-Z0-9_-]", "g"), function(c) {
            var subs = {
                "Æ": "AE",
                "Ø": "O",
                "Å": "AA",
                "æ": "ae",
                "ø": "o",
                "å": "aa",
                "é": "e",
                "?": "",
                ":": "",
                " ": "_"
            };
            if (typeof subs[c] === "string") {
                return subs[c];
            } else {
                return "_";
            }
        });
    }; //}}}
    // local storage {{{
    if (qp.nodejs) {
        (function() {
            //TODO: change api
            var db = qp.trycatch(function() {
                return JSON.parse(require("fs")["readFileSync"](process["env"]["HOME"] + "/data/local.sqlite3"));
            }, function() {
                return {};
            });
            var syncLocalStorage = qp.throttledFn(function() {
                require("fs")["writeFile"](process["env"]["HOME"] + "/data/local.sqlite3", JSON.stringify(db, null, "  "));
            });
            var lastSync = 0;
            qp.local = {
                set: function(key, val) {
                    db[key] = val;
                    syncLocalStorage();
                },
                get: function(key) {
                    return db[key];
                }
            };
        })();
    } else if (typeof localStorage !== "undefined") {
        qp.local = {
            set: function(key, val) {
                localStorage.setItem(key, val);
            },
            get: function(key) {
                localStorage.getItem(key);
            }
        };
    } //}}}
    // runonce {{{
    qp.runonce = function(fn) {
        var execute = true;
        return function() {
            if (execute) {
                fn.apply(this, Array.prototype.slice.call(arguments, 0));
                execute = false;
            }
        };
    }; //}}}
    // flatteArray {{{
    qp.flattenArray = function(arr) {
        var acc = [];
        var flatten = function(arr) {
            if (Array.isArray(arr)) {
                arr.forEach(flatten);
            } else {
                acc.push(arr);
            }
        };
        flatten(arr);
        return acc;
    }; //}}}
    // valmap {{{
    qp.valmap = function(obj, fn) {
        var result = {};
        Object.keys(obj).forEach(function(key) {
            result[key] = fn(obj[key]);
        });
        return result;
    }; //}}}
    // emptyObject {{{
    qp.emptyObject = function(obj) {
        return Object.keys(obj).length === 0;
    }; //}}}
    // strStartsWith {{{
    qp.strStartsWith = function(str1, str2) {
        return str1.slice(0, str2.length) === str2;
    }; //}}}
    // objForEach {{{
    qp.objForEach = function(obj, fn) {
        Object.keys(obj).forEach(function(key) {
            fn(key, obj[key]);
        });
    }; //}}}
    // mkdir,cp,mtime {{{
    if (qp.nodejs) {
        var fs = require("fs");
        var dirs = {};
    }
        qp.mkdir = function(path) {
            if(qp.nodejs) {
            if (!dirs[path] && !fs["existsSync"](path)) {
                path = path.split("/");
                while (!path[path.length - 1]) {
                    path.pop();
                }
                qp.mkdir(path.slice(0, -1).join("/"));
                fs["mkdirSync"](path.join("/"));
                dirs[path] = true;
            }
            }
        };
        qp.cp = function(src, dst, callback) {
            if(qp.nodejs) {
            require("util").pump(fs["createReadStream"](src), fs["createWriteStream"](dst), callback);
            }
        };
        qp.mtime = function(filename) {
            if(qp.nodejs) {
            return qp.trycatch(function() {
                return fs["statSync"](filename).mtime.getTime();
            }, function() {
                return 0;
            });
            }
        };
    //}}}
    qp.shuffleArray = function(arr) { //{{{
        var i = arr.length;
        while (i) {
            --i;
            var r = Math.random() * arr.length | 0;
            var t = arr[i];
            arr[i] = arr[r];
            arr[r] = t;
        }
        return arr;
    }; //}}}
    qp.arrayPickRandom = function(arr) { //{{{
        return arr[Math.random() * arr.length | 0];
    }; //}}}
    // save/load json {{{
    if (qp.nodejs) {
        qp.saveJSON = function(filename, content, callback) {
            require("fs")["writeFile"](filename, JSON.stringify(content), callback);
        };
        qp.loadJSONSync = function(filename, defaultVal) {
            if (!defaultVal) {
                defaultVal = function(e) {
                    return {
                        err: e
                    };
                };
            }
            var fn = typeof defaultVal === "function" ? defaultVal : function(err) {
                    return defaultVal;
                };
            return qp.trycatch(function() {
                return JSON.parse(require("fs")["readFileSync"](filename, "utf8"));
            }, fn);
        };
    } //}}}
    // }}}
    // qp.V2d {{{
    /** @constructor */
    qp.V2d = function(x, y) { //{{{
        this.x = x;
        this.y = y;
    }; //}}}
    qp.V2d.prototype.add = function(v) { //{{{
        return new V2d(this.x + v.x, this.y + v.y);
    }; //}}}
    qp.V2d.prototype.sub = function(v) { //{{{
        return new V2d(this.x - v.x, this.y - v.y);
    }; //}}}
    qp.V2d.prototype.scale = function(a) { //{{{
        return new V2d(this.x * a, this.y * a);
    }; //}}}
    qp.V2d.prototype.length = function() { //{{{
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }; //}}}
    qp.V2d.prototype.dot = function(v) { //{{{
        return this.x * v.x + this.y * v.y;
    }; //}}}
    qp.V2d.prototype.norm = function() { //{{{
        var len = this.length();
        return this.scale(len ? 1 / len : 0);
    }; //}}}
    qp.V2d.prototype.dist = function(v) { //{{{
        var d = this.sub(v);
        return Math.sqrt(d.dot(d));
    }; //}}}
    qp.V2d.prototype.neg = function(v) { //{{{
        return new V2d(-this.x, -this.y);
    }; //}}}
    //}}}
    // Graph algorithms {{{
    /*
    // # Spring-based graph layout {{{
    // This is experimental code, not really intended for reading yet.
    qp.init = function(app) {
        var canvas = app.canvas;
        canvas.width = app.w;
        canvas.height = app.h;
        var running = true;
        var basegraph = {};
        var i = 0;
        while (i < 100) {
            basegraph[i] = [];
            basegraph[Math.random() * i | 0].push(i);
            ++i;
        }
        //basegraph[0].push('0,0');
        Object.keys(basegraph).forEach(function(id) {
            basegraph[id] = {
                id: id,
                force: new V2d(0, 0),
                velocity: new V2d(Math.random() - 0.5, Math.random() - 0.5),
                pos: new V2d(Math.random(), Math.random()),
                children: basegraph[id]
            };
        });
        var graph = [];
        Object.keys(basegraph).forEach(function(id) {
            basegraph[id].children = basegraph[id].children.map(function(child) {
                return basegraph[child];
            });
            graph.push(basegraph[id]);
        });
        var spring = 0.1;
        var repuls = 1;
        var dampening = 0.90;
        var maxspeed = 0.01;
        var run = function() {
            // ### Calculate force
            graph.forEach(function(elem) {
                elem.force = new V2d(0, 0);
            });
            // #### Edges/springs
            graph.forEach(function(a) {
                a.children.forEach(function(b) {
                    var v = b.pos.sub(a.pos);
                    var force = v.scale(spring * Math.min(v.length(), 100));
                    a.force = a.force.add(force);
                    b.force = b.force.add(force.neg());
                });
            });
            // #### Collisions
            graph.forEach(function(a) {
                graph.forEach(function(b) {
                    if (a.id !== b.id) {
                        var v = a.pos.sub(b.pos).norm();
                        var d = b.pos.dist(a.pos);
                        if (d < Math.PI / 2) {
                            //a.force = a.force.add( v.scale(repuls * Math.cos(d)));
                            a.force = a.force.add(v.scale(repuls * (Math.PI / 2 - d)));
                        }
                    }
                });
            });
            // ### Calculate velocity
            graph.forEach(function(elem) {
                elem.velocity = elem.velocity.add(elem.force);
                elem.velocity = elem.velocity.scale(dampening);
                if (elem.velocity.length() > maxspeed) {
                    elem.velocity.scale(maxspeed - elem.velocity.length());
                }
            });
            // ### Calculate position
            graph.forEach(function(elem) {
                var rescale = elem.velocity.length();
                elem.pos = elem.pos.add(elem.velocity.scale(1 / Math.sqrt(1 + rescale)));
            });
            // ### Blit and repeat
            drawGraph();
            if (running) {
                setTimeout(run, 0);
            }
        };
        var runno = 0;
        var drawGraph = function() {
    //    if((++runno) & 15) {
            //return undefined;
        //}
            var minx = Math.min.apply(undefined, graph.map(function(e) {
                return e.pos.x;
            }));
            var miny = Math.min.apply(undefined, graph.map(function(e) {
                return e.pos.y;
            }));
            var maxx = Math.max.apply(undefined, graph.map(function(e) {
                return e.pos.x;
            }));
            var maxy = Math.max.apply(undefined, graph.map(function(e) {
                return e.pos.y;
            }));
            var ctx = canvas.getContext("2d");
            var transform = function(a) {
                return new V2d((a.x - minx) / (maxx - minx) * canvas.width, (a.y - miny) / (maxy - miny) * canvas.height);
            };
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            var line = function(a, b) {
                ctx.lineWidth = 3;
                var p1 = transform(a);
                ctx.moveTo(p1.x, p1.y);
                var p2 = transform(b);
                ctx.lineTo(p2.x, p2.y);
            };
            var drawdot = function(a) {
                var p = transform(a.pos);
                var sz = 24;
                ctx.lineWidth = 1;
                ctx.strokeRect(p.x - sz, p.y - sz, sz * 2, sz * 2);
                ctx.fillStyle = "rgba(255,255,255,.7)";
                ctx.fillRect(p.x - sz + 1, p.y - sz + 1, sz * 2 - 2, sz * 2 - 2);
                ctx.fillStyle = "#000";
                ctx.fillText(a.id, p.x - 17, p.y);
            };
            graph.forEach(function(a) {
                a.children.forEach(function(b) {
                    line(a.pos, b.pos);
                });
            });
            ctx.stroke();
            graph.forEach(function(a) {
                drawdot(a);
            });
            //ctx.fillText(passt, 0, 20);
            //ctx.fillText(JSON.stringify(graph.map(function(b){return graph[0].pos.dist(b.pos);})), 0,40);
        };
        run();
    }; //}}}
    */
    qp.graphUpdateParents = function(graph) { //{{{
        qp.objForEach(graph, function(_, node) {
            node.parents = {};
        });
        qp.objForEach(graph, function(nodeId, node) {
            qp.objForEach(node.children, function(key, _) {
                graph[key].parents[nodeId] = true;
            });
        });
    }; //}}}
    qp.traverseDAG = function(graph) { //{{{
        var result = [];
        qp.graphUpdateParents(graph);
        var visited = {};
        var prevLength = -1;
        while (result.length !== prevLength) {
            prevLength = result.length;
            qp.objForEach(graph, visitEachNode);
        }

        function visitEachNode(nodeId, node) {
            if (!visited[nodeId]) {
                var ok = true;
                Object.keys(node.parents).forEach(function(parentId) {
                    if (!visited[parentId]) {
                        ok = false;
                    }
                });
                if (ok) {
                    result.push(nodeId);
                    visited[nodeId] = true;
                }
            }
        }
        return result;
    }; //}}}
    qp.ensureNode = function(graph, name) { //{{{
        if (!graph[name]) {
            graph[name] = {
                id: name,
                children: {}
            };
        }
    }; //}}}
    qp.addEdge = function(graph, from, to) { //{{{
        qp.ensureNode(graph, from);
        qp.ensureNode(graph, to);
        graph[from].children[to] = graph[from].children[to] || {};
    }; //}}}
    qp.testGraph = function(test) { //{{{
        var g = {};
        qp.addEdge(g, "a", "b");
        qp.addEdge(g, "b", "c");
        qp.addEdge(g, "a", "c");
        test.assertEqual(JSON.stringify(qp.traverseDAG(g)), "[\"a\",\"b\",\"c\"]");
        qp.graphUpdateParents(g);
        test.assert(qp.emptyObject(g.a.parents), "a has no parents");
        test.assert(g.c.parents.a, "c has parent a");
        test.done();
    }; //}}}
    // }}}
    // HXML {{{
    qp.HXML = function(xml) {
        /*
        if (typeof xml === "string") {}
        if (Array.isArray(xml)) {}
        */
    };
    var xmlEntities = { //{{{
        lt: "<",
        gt: ">",
        amp: "&",
        quot: "\"",
        nbsp: "\xa0"
    }; //}}}
    function jmlFilterWs(jml) { //{{{
        if (typeof jml === "string") {
            return jml.trim();
        } else if (Array.isArray(jml)) {
            return jml.map(jmlFilterWs).filter(function(s) {
                return s !== "";
            });
        } else {
            return jml;
        }
    } //}}}
    function strToJsonml(str) { //{{{
        var errors = [];

        function jsonmlError(str) {
            errors.push(str);
        }
        if (typeof(str) !== "string") {
            throw "parameter must be string";
        }

        /** white space definition */
        var whitespace = " \n\r\t";
        /** the current char in the string that is being parsed */
        var c = str[0];
        /** The position in the string */
        var pos = 0;
        /** Stack for handling nested tags */
        var stack = [];
        /** Current tag being parsed */
        var tag = [];
        /** read the next char from the string */
        function next_char() {
            c = ++pos < str.length ? str[pos] : undefined;
        }
        /** check if the current char is one of those in the string parameter */
        function is_a(str) {
            return str.indexOf(c) !== -1;
        }
        /** return the string from the current position to right before the first
         * occurence of any of symb. Translate escaped xml entities to their value
         * on the fly.
         */
        function read_until(symb) {
            var result = "";
            while (c && !is_a(symb)) {
                if (c === '&') {
                    next_char();
                    var entity = read_until(';');
                    if (entity[0] === '#') {
                        if (entity[1] === 'x') {
                            c = String.fromCharCode(parseInt(entity.slice(2), 16));
                        } else {
                            c = String.fromCharCode(parseInt(entity.slice(1), 10));
                        }
                    } else {
                        c = xmlEntities[entity];
                        if (!c) {
                            jsonmlError("error: unrecognisable xml entity: " + entity);
                        }
                    }
                }
                result += c;
                next_char();
            }
            return result;
        }

        // The actual parsing
        while (is_a(whitespace)) {
            next_char();
        }
        while (c) {
            if (is_a("<")) {
                next_char();

                // `<?xml ... >`, `<!-- -->` or similar - skip these
                if (is_a("?!")) {
                    if (str.slice(pos, pos + 3) === "!--") {
                        pos += 3;
                        while (pos <= str.length && str.slice(pos, pos + 2) !== "--") {
                            ++pos;
                        }
                    }
                    read_until('>');
                    next_char();

                    // `<sometag ...>` - handle begin tag
                } else if (!is_a("/")) {
                    // read tag name
                    var newtag = [read_until(whitespace + ">/")];

                    // read attributes
                    var attributes = {};
                    while (c && is_a(whitespace)) {
                        next_char();
                    }
                    while (c && !is_a(">/")) {
                        var attr = read_until(whitespace + "=>");
                        if (c === "=") {
                            next_char();
                            var value_terminator = whitespace + ">/";
                            if (is_a('"\'')) {
                                value_terminator = c;
                                next_char();
                            }
                            attributes[attr] = read_until(value_terminator);
                            if (is_a('"\'')) {
                                next_char();
                            }
                        } else {
                            jsonmlError("something not attribute in tag");
                        }
                        while (c && is_a(whitespace)) {
                            next_char();
                        }
                    }
                    newtag.push(attributes);

                    // end of tag, is it `<.../>` or `<...>`
                    if (is_a("/")) {
                        next_char();
                        if (!is_a(">")) {
                            jsonmlError('expected ">" after "/" within tag');
                        }
                        tag.push(newtag);
                    } else {
                        stack.push(tag);
                        tag = newtag;
                    }
                    next_char();

                    // `</something>` - handle end tag
                } else {
                    next_char();
                    if (read_until(">") !== tag[0]) {
                        jsonmlError("end tag not matching: " + tag[0]);
                    }
                    next_char();
                    var parent_tag = stack.pop();
                    if (tag.length <= 2 && !Array.isArray(tag[1]) && typeof(tag[1]) !== "string") {
                        tag.push("");
                    }
                    parent_tag.push(tag);
                    tag = parent_tag;

                }

                // actual content / data between tags
            } else {
                tag.push(read_until("<"));
            }
        }
        if (errors.length) {
            console.log(errors);
        }
        return tag;
    } //}}}
    function values(obj) { //{{{
        var result = [];
        for (var key in obj) {
            result.push(obj[key]);
        }
        return result;
    } //}}}
    function jmlToDom(jml) { //{{{
        if (Array.isArray(jml)) {
            var children;
            var classes = jml[0].split(".");
            var name = classes[0];
            classes = classes.slice(1);
            var attr = jml[1];
            var pos = 1;
            if (typeof attr === "object" && attr.constructor === Object) {
                ++pos;
                attr = attr;
            } else {
                attr = {};
            }
            if (classes.length) {
                attr["class"] = classes.join(" ");
            }
            var elem = document.createElement(name);
            for (var prop in attr) {
                elem.setAttribute(prop, attr[prop]);
            }
            while (pos < jml.length) {
                if (jml[pos]) {
                    elem.appendChild(jmlToDom(jml[pos]));
                }++pos;
            }
            return elem;
        } else if (typeof jml === "string" || typeof jml === "number") {
            return document.createTextNode(jml);
        } else {
            return jml;
        }
    } //}}}
    function jmlToStr(jml) { //{{{
        if (Array.isArray(jml)) {
            var children;
            var classes = jml[0].split(".");
            var name = classes[0];
            classes = classes.slice(1);
            var attr = jml[1];
            var pos = 1;
            if (typeof attr === "object" && attr.constructor === Object) {
                children = jml.slice(2);
                attr = attr;
            } else {
                children = jml.slice(1);
                attr = {};
            }
            if (classes.length) {
                attr["class"] = classes.join(" ");
            }
            var result = "<" + name + Object.keys(attr).map(function(key) {
                return " " + key + "=\"" + attr[key] + "\"";
            }).join("");

            if (children.length === 0) {
                result += "/>";
            } else {
                result += ">";
                result += children.map(jmlToStr).join("");
                result += "</" + name + ">";
            }

            return result;
        } else {
            return String(jml);
        }
    } //}}}
    //}}}
    // test {{{
    // TestSuite class {{{
    function TestSuite(name, doneFn) { //{{{
        this.name = name;
        this.suites = 1;
        this.errCount = 0;
        if (doneFn) {
            this.doneFn = doneFn;
        }
    } //}}}
    TestSuite.prototype.fail = function(expr, desc) { //{{{
        ++this.errCount;
        console.log("Fail in " + this.name + ": " + desc);
    }; //}}}
    TestSuite.prototype.assert = function(expr, desc) { //{{{
        if (!expr) {
            ++this.errCount;
            console.log("Assert in " + this.name + ": " + desc);
        }
    }; //}}}
    TestSuite.prototype.done = function() { //{{{
        this.suites -= 1;
        this._cleanup();
    }; //}}}
    TestSuite.prototype.suite = function(name) { //{{{
        var result = new TestSuite(this.name + "#" + name);
        result.parent = this;
        this.suites += 1;
        return result;
    }; //}}}
    TestSuite.prototype._cleanup = function() { //{{{
        if (this.suites === 0) {
            if (this.doneFn) {
                this.doneFn(this.errCount);
            }
            if (this.parent) {
                this.parent.errCount += this.errCount;
                this.parent.suites -= 1;
                this.parent._cleanup();
            }
        }
    }; //}}}
    //}}}
    function testClient(test) { //{{{
        test.done();
    }
    if (qp.html5) {
        window["testClient"] = testClient;
    }
    //}}}
    function runTests() { //{{{
        var Browser = require("zombie");
        var test = new TestSuite("BibData", process["exit"]);

        // testServer(test.suite("server"));

        // start the client-test via zombie
        var clientSuite = test.suite("client");
        var browser = new Browser();
        browser.visit("http://" + qp.host + ":" + qp.port, {
            debug: true
        }).then(function() {
            browser["window"]["testClient"](clientSuite);
        }).fail(function() {
            clientSuite.fail("could not start client-test");
            test.done();
        });
        test.done();
    } //}}}
    // }}}
    // Testrunner {{{
    qp.test = function(test) {
        if (qp.nodejs) {
            var jsontest = test.create("load/save-JSON");
            var result = qp.loadJSONSync("/does/not/exists", 1);
            jsontest.assertEqual(result, 1);
            qp.saveJSON("/tmp/exports-save-json-testb", 2);
            qp.saveJSON("/tmp/exports-save-json-test", 2, function() {
                result = qp.loadJSONSync("/tmp/exports-save-json-test", 1);
                jsontest.assertEqual(result, 2);
                jsontest.done();
            });
        }
        var count = 0;
        var obj = {
            a: 1,
            b: 2
        };
        qp.objForEach(obj, function(key, val) {
            test.assert(key && obj[key] === val, "objforeach");
            ++count;
        });
        test.assertEqual(count, 2, "objforeach count");
        test.assert(qp.strStartsWith("foobarbaz", "foobar"), "strstartswith1");
        test.assert(!qp.strStartsWith("qoobarbaz", "foobar"), "strstartswith2");
        test.assert(qp.strStartsWith("foobarbaz", ""), "strstartswith3");
        test.assert(!qp.strStartsWith("foo", "foobar"), "strstartswith4");
        test.done();
    };
    // }}}
    // qp.Client {{{
    qp.Client = function(platform, app, path, opt) {
        this.platform = platform;
        this.app = app;
        this.path = path;
        for (var key in opt) {
            this[key] = opt[key];
        }
    };
    qp.Client.prototype.text = function(str) {
        var prev = this.resultText || "";
        this.resultText = prev + str;
        return this;
    };
    qp.Client.prototype.end = function() {
        if (this.platform === "command") {
            console.log(this.resultText);
        } else if (this.platform === "http") {
            this.res.end(this.resultText);
        } else {
            throw "unimplemented platform: " + this.platform;
        }
    };
    // }}}
    // app router {{{
    // route object {{{
    var apps = {
        "undefined": {}
    };
    if (qp.nodejs) {
        apps["command"] = {};
        apps["http"] = {};
    }
    if (qp.html5) {
        apps["html5"] = {};
    }
    //}}}
    function registerRoute(platform, name, path, obj) { //{{{
        var appPlatform = apps[platform];
        if (appPlatform) {
            var app = appPlatform[name];
            if (!app) {
                app = {};
                appPlatform[name] = app;
            }
            app[path] = obj;
        }
    } //}}}
    qp.register = function(obj) { //{{{
        if (typeof obj.fn !== "function") {
            throw "qp.register parameter must have a 'fn'-property of type function";
        }
        var platforms = obj.platforms || [obj.platform];
        var names = obj.names || [obj.name];
        var paths = obj.paths || [obj.path];
        var i, j, k;
        for (i = 0; i < platforms.length; ++i) {
            for (j = 0; j < names.length; ++j) {
                for (k = 0; k < paths.length; ++k) {
                    registerRoute(platforms[i], names[j], paths[k], obj);
                }
            }
        }
    }; //}}}
    qp.resolveRoute = function(platform, name, path) { //{{{
        function lookup(platform, name, path) {
            return apps[platform] && apps[platform][name] && apps[platform][name][path];
        }
        return lookup(platform, name, path) || lookup(undefined, name, path) || lookup(platform, name, undefined) || lookup(undefined, name, undefined) || lookup(platform, undefined, path) || lookup(undefined, undefined, path) || lookup(platform, undefined, undefined) || lookup(undefined, undefined, undefined);
    }; //}}}
    qp.register({
        fn: function(client) { //{{{
            var platform = client.platform;
            client.text("Error: no " + platform + " route found.\n");
            client.text("Available routes:");
            for (var app in apps[platform]) {
                for (var path in apps[platform][app]) {
                    client.text("\n   ");
                    if (app === "undefined") {
                        client.text("*");
                    } else {
                        client.text(app);
                    }
                    client.text(" ");
                    if (path === "undefined") {
                        client.text("*");
                    } else {
                        client.text(path);
                    }
                }
            }
            client.end();
        }
    }); //}}}
    qp.scope = function(scopeObj) { //{{{
        var scope = {
            register: function(childObj) {
                qp.register(qp.extend({}, scopeObj, childObj));
                return scope;
            }
        };
        return scope;
    }; //}}}
    var getPath, getAppName; //{{{
    if (qp.nodejs) {
        getAppName = function() {
            return process["argv"][2];
        };
        getPath = function() {
            return process["argv"][3];
        };
    } else if (qp.html5) {
        getAppName = function() {
            return window["qpApp"] || location.host.split(".")[0];
        };
        getPath = function() {
            var path;
            if (location.hash) {
                path = location.hash;
            } else {
                path = location.pathname;
            }
            path = path.slice(1).split(".")[0];
            return path;
        };
    } //}}}
    function go(platform, name, path, opt) { //{{{
        var obj = qp.resolveRoute(platform, name, path);
        obj.fn(new qp.Client(platform, name, path, opt));
    } //}}}
    function main() { //{{{
        var platform;
        if (qp.nodejs) {
            platform = "command";
        } else if (qp.html5) {
            platform = "html5";
        }
        go(platform, getAppName(), getPath());
    }
    qp.nextTick(main); //}}}
    //}}}
    // css/dom-processing-monad{{{
    // DomProcess {{{
    function DomProcess() { //{{{
        this.apply = function(dom) {
            return this;
        };
    } //}}}
    DomProcess.prototype.bind = function(f) { //{{{
        var apply = this.apply;
        this.apply = function(dom) {
            apply(dom);
            f(dom);
            return this;
        };
        return this;
    }; //}}}
    DomProcess.prototype.css = function(style) { //{{{
        this.bind(function(dom) {
            var styleObj = dom.style;
            for (var prop in style) {
                var val = style[prop];
                if (typeof val === "number") {
                    val = (val | 0) + "px";
                }
                styleObj[prop] = val;
            }
        });
        return this;
    }; //}}}
    DomProcess.prototype.on = function(event, fn) { //{{{
        this.bind(function(dom) {
            var evs = event.split(" ");
            for (var i = 0; i < evs.length; ++i) {
                dom["on" + evs[i]] = fn;
            }
        });
        return this;
    }; //}}}
    //}}}
    function css(obj) { //{{{
        return (new DomProcess()).css(obj);
    } //}}}
    function domRecursiveApply(domNode, table) { //{{{
        var i;
        var classes = domNode.classList;
        if (classes) {
            for (i = 0; i < classes.length; ++i) {
                var entry = table[classes[i]];
                if (entry) {
                    entry.apply(domNode);
                }
            }
        }
        if (table["default"]) {
            table["default"].apply(domNode);
        }

        var children = domNode.children;
        for (i = 0; i < children.length; ++i) {
            domRecursiveApply(children[i], table);
        }
    } //}}}
    //}}}
    // dev-server {{{
    if (qp.nodejs) {
        var startDevServer = function(client) {
            var devServer = function(req, res) {
                var name = client.path;
                var path = req.url.slice(1).split(/[.?]/)[0];
                go("http", name, path, {
                    req: req,
                    res: res
                });
            };
            var app = require("http").createServer(devServer);
            var io = require("socket.io").listen(app);
            app.listen(qp.port, qp.host, function() {
                console.log("dev-server running on", qp.host + ":" + qp.port);
            });
        };
        qp.register({
            platform: "command",
            name: "dev-server",
            fn: startDevServer
        });
    } //}}}
    // build {{{
    if (qp.nodejs) {
        var concatSource = function(callback) {
            var fs = require("fs");
            var appSource, qpSource;
            // read the app source code
            fs["readFile"](process["argv"][1], "utf8", function(err, data) {
                if(err) throw err;
                appSource = data;
                fileLoaded();
            });
            // read the qp-library source code
            fs["readFile"](__filename, "utf8", function(err, data) {
                if(err) throw err;
                qpSource = data;
                fileLoaded();
            });
            // concatenate
            function fileLoaded() {
                if(!qpSource || !appSource) return;
                var dir = process["cwd"]() + "/build";
                qp.mkdir(dir);
                var outputFileName = dir + "/q.js";
                var closure = require("closure-compiler");
                console.log("running closure compiler");
                //var source = "(function(){" + qpSource + appSource + "})()"
                var source = "";
                //source += "/**@const*/var process = false";
                source += "/**@const*/var PLATFORM_NODEJS = true;";
                source += qpSource.replace("module[\"exports\"] = qp;", "");
                //source += appSource.replace(/require\s*\(\s*['"](\.\/)?qp['"]\s*\)/g, "qp");
                closure["compile"](source, {
                    "compilation_level": "ADVANCED_OPTIMIZATIONS",
                    "use_types_for_optimization": "--use_types_for_optimization",
                    "formatting": "PRETTY_PRINT"
                }, function(err, result) {
                    if(err) throw err;
                    console.log("writing", outputFileName);
                    fs["writeFile"](outputFileName, result);
                });
            }
        };
        var optimiseSource = function(directory) {
        };
        var buildApp = function(client) {
            concatSource(function() {
            });
        };
        qp.register({
            platform: "command",
            name: "build",
            fn: buildApp
        });
    }
    // }}}
    // file end {{{
})();
// }}}
