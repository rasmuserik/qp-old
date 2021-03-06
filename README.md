![logo](https://solsort.com/_logo.png)
[![ci](https://secure.travis-ci.org/rasmuserik/qp.png)](http://travis-ci.org/rasmuserik/qp)

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
    require("qp")(global);
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

# Notes
- external libraries
    - general libraries
        - google closure library
        - socket.io
        - ES5-shim/json
    - platform
        - bootstrap
        - font-awesome
        - phonegap
    - build tools
        - jsdoc
        - google closure compiler
- primary platforms/targets
    - node.js-command-line 
    - node.js-static-server 
    - html5-web-app 
    - node.js-rpc 
    - secondary platforms
        - phonegap-app 
        - firefox-jetpack-addon/marketplace 
        - gjs 
        - npm-module
        - winjs 
        - appjs
        - tidesdk
        - chrome-extension/web-store 
        - facebook/html5/distribution 
        - chrome-apps 
        - rhino/nashorn/javascript-app
