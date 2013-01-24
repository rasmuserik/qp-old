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
    qp.nextTick = function(fn) {
        if (qp.nodejs) {
            process.nextTick(fn);
        } else {
            setTimeout(fn, 0);
        }
    }
    // }}}
    // HXML {{{
    qp.HXML = function(xml) {
    }
    // }}}
    // route {{{
    if (qp.nodejs) {
        qp.nextTick(function() {

        });
    }
    // }}}
    // file end {{{
})();
// }}}
