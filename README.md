# qp JavaScript library


Lifting various reusable code out to a personal JS-library


Becoming closure-advanced-optimizable

## Getting started:

    $ mkdir MyApp && cd MyApp 
    $ cat > package.json
    { "name": "MyApp",
      "version": "0.0.1",
      "author": "me",
      "dependencies": {"qp":"git://github.com/rasmuserik/qp.git#master"}
    }
    $ cat > app.js
    if(typeof qp === "undefined") { qp = require("qp"); }
    qp.register({fn: function(client) {
        client.text("hello from app").end();
    }});
    $ npm install
    [...]
    $ node app.js
    hello from app
    $ node app.js dev-server
    [...]
    dev-server running on localhost:1234

open `http://localhost:1234/` in browser to visit app

# TODO / to-lift

- Yolan
    - prettyprint/parse list
    - map between mozilla-parser-api and Yolan lists
- HXML
    - xmljs
    - parse/emit: xml/html, sxml/jsonml, dom
    - visit/apply style
- CSS
    - load global 
- Route
    - client/server
        - client-side: url hash / location mapping to app content
        - server-side: generate page or data from url + evt. content negitiation
        - cmd: execute command based on parameter
    - workings: table of tables | callback functions taking a 
- Build
    - watcher/dev-server
    - build 
        - production node.js-server
            - include serving bootstrap+font-awesome+socket.io+...
        - html5 app
        - phonegap github repos
        - npm module
    - tool-executer
        - closure-compile
        - js-beautify
        - jshint
        - travis-setup
        - testling-setup
        - codescore-setup
        - test/code-coverage (burrito?)
- Test
    - testrunner
- Toolbox
    - utilities for running: js-beautify, closure-compiler, js-hint, travis-ci, testling, npm-packaging building

