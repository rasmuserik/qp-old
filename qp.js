/*jshint sub:true*/
/*global global BUILTIN_ROUTES PLATFORM_NODEJS PLATFORM_HTML5 process setTimeout location require console window localStorage document module __dirname __filename*/
/**
 * The qp module is a collection of utilities.
 * @namespace
 */
var qp = {};
qp.platform = {};
/**@namespace*/
qp.fn = {};
/**@namespace*/
qp.sys = {};
/**@namespace*/
qp.set = {};
/**@namespace*/
qp.str = {};
/**@namespace*/
qp.obj = {};
/**@namespace*/
qp.arr = {};
/**@namespace*/
qp.route = {};
/**@namespace*/
qp.dev = {};
(function() {
    "use strict";
    // environment {{{
    /** @type {boolean} */
    qp.platform.nodejs = typeof PLATFORM_NODEJS !== "undefined" ? PLATFORM_NODEJS : typeof process !== "undefined";
    /** @type {boolean} */
    qp.platform.html5 = typeof PLATFORM_HTML5 !== "undefined" ? PLATFORM_HTML5 : !qp.platform.nodejs;
    /** @type {string} */
    qp.host = "localhost";
    /** @type {number} */
    qp.port = 1234;
    // }}}
    // setup {{{
    //
    if(qp.platform.nodejs) {
        global["CLOSURE_BASE_PATH"] = __dirname + "/external/google-closure-library/closure/goog/"
        require("closure")["Closure"](global);
    }
    if (typeof module !== "undefined") {
        module["exports"] = function(moduleGlobal) {
            if(qp.platform.nodejs) {
                moduleGlobal["CLOSURE_BASE_PATH"] = global["CLOSURE_BASE_PATH"];
                require("closure")["Closure"](moduleGlobal);
            }
            moduleGlobal.qp = qp;
        }
    }
    //}}}
    //util{{{
    if (qp.platform.nodejs) {
        var fs = require("fs");
    }
    //{{{obj
    //{{{extend
    /** Copy elements from a list of objects onto target
     * @type {function(Object, ...[Object]): Object}
     */
    qp.obj.extend = function(target) {
        for (var i = 1; i < arguments.length; ++i) {
            var obj = arguments[i];
            for (var key in obj) {
                target[key] = obj[key];
            }
        }
        return target;
    }; //}}}
    //{{{map
    /** map a function across the values of an object, and return a new object with the resulting values
     * @param {!Object} obj
     * @param {function(*)} fn
     * @return {Object}
     */
    qp.obj.map = function(obj, fn) {
        var result = {};
        Object.keys(obj).forEach(function(key) {
            result[key] = fn(obj[key]);
        });
        return result;
    }; //}}}
    //{{{notEmpty
    /** Check if an object is an empty object
     * @param {!Object} obj
     * @return {boolean}
     */
    qp.obj.notEmptyObject = function(obj) {
        return Object.keys(obj).length !== 0;
    }; //}}}
    //{{{empty
    /** Check if an object is an empty object
     * @param {!Object} obj
     * @return {boolean}
     */
    qp.obj.empty = function(obj) {
        return Object.keys(obj).length === 0;
    }; //}}}
    // objForEach {{{
    /** call a function on each key/val
     * @param {!Object} obj
     * @param {function(string,*)} fn
     */
    qp.obj.forEach = function(obj, fn) {
        Object.keys(obj).forEach(function(key) {
            fn(key, obj[key]);
        });
    }; //}}}
    //}}}
    //{{{arr
    //listpp{{{
    /** Prettyprint a list
     * @param {Array|string} list list to prettyprint
     * @param {string=} indent string to use as indent (some spaces or tabs)
     * @return {string} text representation of indented list
     */
    qp.arr.listpp = function(list, indent) {
        indent = indent || "  ";
        if (typeof list === "string") {
            return list;
        }
        var result = list.map(function(elem) {
            return qp.arr.listpp(elem, indent + "  ");
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
    //{{{flatten
    /** collapse nested arrays into a single new array
     * @param {Array} arr
     * @return {Array}
     */
    qp.arr.flatten = function(arr) {
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
    //shuffle{{{
    /** Put an array in random order (in-place)
     * @param {Array} arr the array to shuffle
     * @return {Array}
     */
    qp.arr.shuffle = function(arr) {
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
    //arrayPickRandom{{{
    /** Pick a random element from an array
     * @param {Array} arr
     */
    qp.arr.pickRandom = function(arr) {
        return arr[Math.random() * arr.length | 0];
    }; //}}}
    //asyncArrayForEach{{{
    /** apply an asynchronous function to each array element
     * @param {Array} arr
     * @param {function(*, function(...[*]))} fn
     * @param {function(...[*])} done
     */
    qp.arr.asyncForEach = function(arr, fn, done) {
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
    //}}}
    //{{{set
    //fromArray{{{
    /** Convert a list into an object with list elements as keys, and true as value. Useful for set-like operations.
     * @param {Array.<string>} arr 
     * @return {Object.<string,boolean>}
     */
    qp.set.fromArray = function(arr) {
        var i;
        var result = {};
        for (i = 0; i < arr.length; ++i) {
            result[arr[i]] = true;
        }
        return result;
    }; //}}}
    //}}}
    //{{{fn
    //{{{id
    /** Identity function */
    qp.fn.id = function(x) {
        return x;
    };
    //}}}
    // runonce {{{
    /** enforce a function only runs once
     * @param {function(...[*])} fn
     * @return {function(...[*])} a new function with same type as the original function, but only executes the original function once, and otherwise just returns undefined
     */
    qp.fn.runonce = function(fn) {
        var execute = true;
        return function() {
            if (execute) {
                fn.apply(this, Array.prototype.slice.call(arguments, 0));
                execute = false;
            }
        };
    }; //}}}
    //throttledFn{{{
    /** make sure a given function is called not called to often
     * @param {function()} fn the function to be executed
     * @param {number=} delay how long (in ms.) should the shortest interval between function calls be. defaults 5000ms
     * @return {function(function()=): undefined}
     */
    qp.fn.throttledFn = function(fn, delay) {
        delay = delay || 5000;
        var lastRun = 0;
        var scheduled = false;
        var callbacks = [];
        /** 
         * @param {function()=} callback
         * @return {undefined}
         */
        function newFn(callback) {
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
                fn.apply(self, [function() {
                    callbacks.forEach(function(f) {
                        f();
                    });
                }]);
            };
            scheduled = true;
            setTimeout(run, Math.max(0, delay - (Date.now() - lastRun)));
        };
        return newFn;
    }; //}}}
    //nextTick{{{
    /** Run a function when current execution flow is done. ie. setTimeout(fn, 0) or something faster with same semantics
     * @param {function()} fn
     * @return {undefined}
     */
    qp.fn.nextTick = function(fn) {
        if (qp.platform.nodejs) {
            process["nextTick"](fn);
        } else {
            setTimeout(fn, 0);
        }
    }; //}}}
    //trycatch{{{
    /** Functional exception handling
     * @param {function()} fn1 function to call
     * @param {function(*)} fn2 exception handling function, called if fn1 throw. The parameter will be execption thrown
     * @return result from fn1 or fn2
     */
    qp.fn.trycatch = function(fn1, fn2) {
        try {
            return fn1();
        } catch (e) {
            return fn2(e);
        }
    }; //}}}
    //}}}
    //{{{str
    //uniqId{{{
    /** get an uniq id by concatenating a prefix to a sequential number
     * @param {string=} prefix
     * @return {string}
     */
    qp.str.uniqId = function(prefix) {
        prefix = prefix || "_";
        ++uniqIdCounter;
        return prefix + String(uniqIdCounter);
    };
    var uniqIdCounter = 0; // }}}
    //urlUnescape{{{
    /** Unescape %-encoding into string
     * @param {string} str
     * @return {string}
     */
    qp.str.urlUnescape = function(str) {
        return str.replace(/\+/g, " ").replace(/%[0-9a-fA-F][0-9a-fA-F]/g, function(code) {
            return String.fromCharCode(parseInt(code.slice(1), 16));
        });
    }; //}}}
    //name2url{{{
    /** generate a sensible url from a string, replace non-url chars with sensible strings or _
     * @param {string} name
     * @return {string}
     */
    qp.str.name2url = function(name) {
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
    // strStartsWith {{{
    /** check if a string has another string as a prefix
     * @param {string} str the string to check
     * @param {string} prefix the prefix
     * @return {boolean}
     */
    qp.str.startsWith = function(str, prefix) {
        return str.slice(0, prefix.length) === prefix;
    }; //}}}
    //}}}
    //{{{sys
    //exec{{{
    /** Run a shell commend 
     * @param {string} cmd
     * @param {function(...[*])} callback
     */
    qp.sys.exec = function(cmd, callback) {
        require("child_process")["exec"](cmd, callback);
    };
    // }}}
    //mkdir{{{
    /** Synchronously create a directory, possibly also create parent directory
     * @param {string} path
     */
    qp.sys.mkdir = function(path) {
        if (qp.platform.nodejs) {
            if (!fs["existsSync"](path)) {
                splitpath = path.split("/");
                while (!spiltpath[spiltpath.length - 1]) {
                    spiltpath.pop();
                }
                qp.sys.mkdir(spiltpath.slice(0, -1).join("/"));
                fs["mkdirSync"](spiltpath.join("/"));
            }
        }
    }; //}}}
    //cp{{{
    /** Copy a file
     * @param {string} src
     * @param {string} dst
     * @param {function(...[*])} callback
     */
    qp.sys.cp = function(src, dst, callback) {
        if (qp.platform.nodejs) {
            require("util")["pump"](fs["createReadStream"](src), fs["createWriteStream"](dst), callback);
        }
    }; //}}}
    //mtime{{{
    /** synchronously get mtime of file
     * @param {string} filename
     */
    qp.sys.mtime = function(filename) {
        if (qp.platform.nodejs) {
            return qp.fn.trycatch(function() {
                return fs["statSync"](filename).mtime.getTime();
            }, function() {
                return 0;
            });
        }
    }; //}}}
    // saveJSON {{{
    /** save json to a file
     * @param {string} filename
     * @param {*} content must be json-able
     * @param {function(*)=} callback
     */
    qp.sys.saveJSON = function(filename, content, callback) {
        require("fs")["writeFile"](filename, JSON.stringify(content), callback);
    };
    //}}}
    //loadJSONSync{{{
    /** Load and parse json from a file
     * @param {string} filename
     * @param {*} defaultVal default value, or a function that yields the default value. This will be returned/called if the file cannot be loaded/parsed to json
     */
    qp.sys.loadJSONSync = function(filename, defaultVal) {
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
        return qp.fn.trycatch(function() {
            return JSON.parse(require("fs")["readFileSync"](filename, "utf8"));
        }, fn);
    }; //}}}
    // TODO local storage {{{
    if (qp.platform.nodejs) {
        (function() {
            //TODO: change api
            var db = qp.fn.trycatch(function() {
                return JSON.parse(require("fs")["readFileSync"](process["env"]["HOME"] + "/data/local.sqlite3"));
            }, function() {
                return {};
            });
            var syncLocalStorage = qp.fn.throttledFn(function() {
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
    //}}}
    //}}}
    // qp.V2d {{{
    /** simple 2d vector
     * @constructor 
     * @param {number} x
     * @param {number} y
     */
    qp.V2d = function(x, y) { //{{{
        this.x = x;
        this.y = y;
    }; //}}}
    qp.V2d.prototype.add = function(v) { //{{{
        return new qp.V2d(this.x + v.x, this.y + v.y);
    }; //}}}
    /** subtract two vectors */
    qp.V2d.prototype.sub = function(v) { //{{{
        return new qp.V2d(this.x - v.x, this.y - v.y);
    }; //}}}
    /** return this vector scaled by a constant */
    qp.V2d.prototype.scale = function(a) { //{{{
        return new qp.V2d(this.x * a, this.y * a);
    }; //}}}
    /** the euclidian length of a vector */
    qp.V2d.prototype.length = function() { //{{{
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }; //}}}
    /** dot product of two vectors */
    qp.V2d.prototype.dot = function(v) { //{{{
        return this.x * v.x + this.y * v.y;
    }; //}}}
    /** the vector normalised to length 1 */
    qp.V2d.prototype.norm = function() { //{{{
        var len = this.length();
        return this.scale(len ? 1 / len : 0);
    }; //}}}
    /** distance between two vectors */
    qp.V2d.prototype.dist = function(v) { //{{{
        var d = this.sub(v);
        return Math.sqrt(d.dot(d));
    }; //}}}
    /** vector in the opposite direction */
    qp.V2d.prototype.neg = function(v) { //{{{
        return new qp.V2d(-this.x, -this.y);
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
        qp.obj.forEach(graph, function(_, node) {
            node.parents = {};
        });
        qp.obj.forEach(graph, function(nodeId, node) {
            qp.obj.forEach(node.children, function(key, _) {
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
            qp.obj.forEach(graph, visitEachNode);
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
        test.assert(qp.obj.empty(g["a"].parents), "a has no parents");
        test.assert(g["c"].parents["a"], "c has parent a");
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
            return document.createTextNode(String(jml));
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
    /** @constructor */
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
    TestSuite.prototype.assertEqual = function(expr1, expr2, desc) { //{{{
        if (expr1 !== expr2) {
            ++this.errCount;
            console.log("Assert in " + this.name + ": " + desc);
        }
    }; //}}}
    TestSuite.prototype.done = function() { //{{{
        this.suites -= 1;
        this._cleanup();
    }; //}}}
    TestSuite.prototype.suite = function(name) { //{{{
        var result = new TestSuite(this.name + "#" + name, this.doneFn);
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
    if (qp.platform.html5) {
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
        browser["visit"]("http://" + qp.host + ":" + qp.port, {
            debug: true
        })["then"](function() {
            browser["window"]["testClient"](clientSuite);
        })["fail"](function() {
            clientSuite.fail("could not start client-test");
            test.done();
        });
        test.done();
    } //}}}
    // }}}
    // Testrunner {{{
    qp.test = function(test) {
        if (qp.platform.nodejs) {
            var jsontest = test.create("load/save-JSON");
            var result = qp.sys.loadJSONSync("/does/not/exists", 1);
            jsontest.assertEqual(result, 1);
            qp.sys.saveJSON("/tmp/exports-save-json-testb", 2);
            qp.sys.saveJSON("/tmp/exports-save-json-test", 2, function() {
                result = qp.sys.loadJSONSync("/tmp/exports-save-json-test", 1);
                jsontest.assertEqual(result, 2);
                jsontest.done();
            });
        }
        var count = 0;
        var obj = {
            a: 1,
            b: 2
        };
        qp.obj.forEach(obj, function(key, val) {
            test.assert(key && obj[key] === val, "objforeach");
            ++count;
        });
        test.assertEqual(count, 2, "objforeach count");
        test.assert(qp.str.startsWith("foobarbaz", "foobar"), "strstartswith1");
        test.assert(!qp.str.startsWith("qoobarbaz", "foobar"), "strstartswith2");
        test.assert(qp.str.startsWith("foobarbaz", ""), "strstartswith3");
        test.assert(!qp.str.startsWith("foo", "foobar"), "strstartswith4");
        test.done();
    };
    // }}}
    // qp.Client {{{
    /** @constructor */
    qp.Client = function(path, opt) {
        this.path = path
        this.opt = opt || {};
    };
    qp.Client.prototype.text = function(str) {
        var prev = this.resultText || "";
        this.resultText = prev + str;
        return this;
    };
    qp.Client.prototype.end = function() {
        console.log(this);
        if (this.opt.platform === "http") {
            this.opt.res.end(this.resultText);
        } else if (qp.platform.nodejs) {
            console.log(this.resultText);
        } else {
            throw "unimplemented platform";
        }
    };
    // }}}
    //{{{router
    var routes = {
        " ": function(client) {
            client.text("Route not found. Available routes:" + Object.keys(routes).join("\n    ")).end();
        }
    };
    //{{{route
    /** add a new route @param {string} path path for the route @param {function(qp.Client)} fn */
    qp.route.add = function(path, fn) {
        routes[path.toLowerCase()] = fn;
    }; //}}}
    //{{{lookupRoute
    /** given a path, return the corresponding handling function @param {string} path */
    qp.route.lookup = function(path) {
        path = path.toLowerCase();
        while (true) {
            if (routes[path]) {
                return routes[path];
            }
            var pos = path.lastIndexOf("/");
            if (pos !== -1) {
                path = path.slice(0, pos);
            } else {
                return routes[" "];
            }
        }
    }; //}}}
    //{{{parseSystemRoute
    /** get the current path/arguments/... @return {Object} */
    qp.route.systemCurrent = function() {
        if (qp.platform.nodejs) {
            return {
                path: process["argv"][2]
            };
        }
        if (qp.platform.html5) {
            var path = (location.hash || location.pathname).slice(1);
            return {
                path: path
            };
        }
    };
    //}}}
    //{{{main
    function main() {
        var route = qp.route.systemCurrent();
        var fn = qp.route.lookup(route.path);
        var client = new qp.Client(route.path, route);
        fn(client);
    }
    qp.fn.nextTick(main);
    //}}}
    // css/dom-processing-monad{{{
    // DomProcess {{{
    /**@constructor*/
    function DomProcess() { //{{{
        this.apply = function(dom) {
            return this;
        };
    } //}}}
    DomProcess.prototype.bind = function(f) { //{{{
        var apply = this.apply;
        this.apply = function(dom) {
            apply.apply(this, [dom]);
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
    // builtin routes {{{
    if (typeof BUILTIN_ROUTES !== "undefined" ? BUILTIN_ROUTES : true) {
        // dev-server {{{
        if (qp.platform.nodejs) {
            var startDevServer = function(client) {
                var devServer = function(req, res) {
                    var path = req.url.slice(1).split(/[.?]/)[0];
                    var fn = qp.route.lookup(path);
                    var client = new qp.Client(path, {
                        platform: "http",
                        req: req,
                        res: res
                    });
                    fn(client);
                };
                var app = require("http")["createServer"](devServer);
                var io = require("socket.io")["listen"](app);
                app["listen"](qp.port, qp.host, function() {
                    console.log("dev-server running on", qp.host + ":" + qp.port);
                });
            };
            qp.route.add("dev-server", startDevServer);
        } //}}}
        // build {{{
        if (qp.platform.nodejs) {
            var concatSource = function(callback) { //{{{
                var fs = require("fs");
                var appSource, qpSource;
                // read the app source code
                fs["readFile"](process["argv"][1], "utf8", function(err, data) {
                    if (err) throw err;
                    data = data.replace(/require\s*\(\s*['"](\.\/)?qp['"]\s*\)\s*\(\s*global\s*\)/g, "");
                    fs["writeFile"](__dirname + "/build/preprocesed.js", data, function() {
                        appSource = data;
                        fileLoaded();
                    });
                });
                // read the qp-library source code
                fs["readFile"](__filename, "utf8", function(err, data) {
                    if (err) throw err;
                    data = data.replace(/moduleGlobal.qp\s*=\s*qp\s*;?/g, "");
                    fs["writeFile"](__dirname + "/build/preprocesed-qp.js", data, function() {
                        qpSource = data;
                        fileLoaded();
                    });
                });
                // concatenate
                function fileLoaded() {
                    if (!qpSource || !appSource) return;
                    var dir = process["cwd"]() + "/build";
                    qp.sys.mkdir(dir);
                    var outputFileName = dir + "/node.js";
                    var closure = require("closure-compiler");
                    console.log("running closure compiler");
                    //var source = "(function(){" + qpSource + appSource + "})()"
                    var source = "";
                    //source += "/**@const*/var process = false";
                    source += "/**@const*/var BUILTIN_ROUTES = false;";
                    source += "/**@const*/var PLATFORM_NODEJS = true;";
                    source += "/**@const*/var PLATFORM_HTML5 = false;";
                    source += qpSource;
                    source += appSource;
                    closure["compile"](source, {
                        "use_types_for_optimization": "--use_types_for_optimization",
                        "summary_detail_level": "3",
                        "warning_level": "VERBOSE",
                        "jscomp_off": "checkVars",
                        //"formatting": "PRETTY_PRINT",
                        "compilation_level": "ADVANCED_OPTIMIZATIONS"
                    }, function(err, result, stderr) {
                        if (err) throw err;
                        console.log(stderr);
                        console.log("writing", outputFileName);
                        fs["writeFile"](outputFileName, result);
                    });
                }
            }; //}}}
            var buildApp = function(client) { //{{{
                concatSource(function() {});
                qp.sys.exec("./node_modules/jsdoc/jsdoc -d doc qp.js", function(err) {
                    if (err) throw err;
                });
            }; //}}}
            qp.route.add("build", buildApp);
        }
        // }}}
    }
    // }}}
    //}}}
    //{{{dev
    qp.dev.typecheck = function(fname) {
        qp.sys.exec("java -jar ./node_modules/closure-compiler/lib/vendor/compiler.jar --summary_detail_level 3 --warning_level VERBOSE --jscomp_off=checkVars --js_output_file /dev/zero qp.js", function(err, stdout, stderr) {
            if (err) throw err;
            console.log(stderr, stdout);
        });
    };
    //}}}
    // file end {{{
})();
// }}}
