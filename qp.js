// setup {{{
if (typeof exports === "undefined") {
    qp = {};
} else {
    qp = exports;
}
(function() {
    "use strict";
    //}}}
    // environment {{{
    qp.nodejs = typeof process !== "undefined" && process.versions && process.versions.node;
    qp.html5 = !qp.nodejs;
    // }}}
    // util {{{
    qp.uniqId = function(prefix) { //{{{
        prefix = prefix || "_";
        ++uniqIdCounter;
        return prefix + String(uniqIdCounter);
    } 
    var uniqIdCounter = 0; // }}}
    qp.nextTick = function(fn) { //{{{
        if (qp.nodejs) {
            process.nextTick(fn);
        } else {
            setTimeout(fn, 0);
        }
    } //}}}
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
    // }}}
    // HXML {{{
    qp.HXML = function(xml) {
        if(typeof xml === "string") {
        } 
        if(Array.isArray(xml)) {
        }
    }
    var xmlEntities = { //{{{
        amp: "&",
        quot: "\"",
        nbsp: "\xa0",
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

        function JsonML_Error(str) {
            errors.push(str);
        }
        if (typeof(str) !== "string") {
            throw "parameter must be string"
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
                            JsonML_Error("error: unrecognisable xml entity: " + entity);
                        }
                    }
                }
                result += c;
                next_char();
            }
            return result
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
                            JsonML_Error("something not attribute in tag");
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
                            JsonML_Error('expected ">" after "/" within tag');
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
                        JsonML_Error("end tag not matching: " + tag[0]);
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
        var classes = domNode.classList;
        if (classes) {
            for (var i = 0; i < classes.length; ++i) {
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
    /** testfunction running on clientside. */
    function testClient(test) { //{{{
        test.done();
    }
    if (qp.html5) {
        window.testClient = testClient;
    }
    //}}}
    function runTests() { //{{{
        var Browser = require("zombie");
        var test = new TestSuite("BibData", process.exit);

        testServer(test.suite("server"));

        // start the client-test via zombie
        var clientSuite = test.suite("client");
        var browser = new Browser();
        browser.visit("http://" + host + ":" + port, {
            debug: true
        })
            .then(function() {
            browser.window.testClient(clientSuite);
        }).fail(function() {
            clientSuite.fail("could not start client-test");
            test.done();
        });

        testZombie(test.suite("ui"));

        test.done();
    } //}}}
    //}}}
    // route {{{
    if (qp.nodejs) {
        qp.nextTick(function() {
            nodeMain();
        });
    }

    function nodeMain() {
        var args = process.argv;
    }

    // }}}
    // file end {{{
})();
// }}}
