[![Build Status](https://travis-ci.org/BlueT/anyroute.js.svg?branch=master)](https://travis-ci.org/BlueT/anyroute.js)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=anyroute&metric=alert_status)](https://sonarcloud.io/dashboard?id=anyroute)
[![Open Source Helpers](https://www.codetriage.com/bluet/anyroute.js/badges/users.svg)](https://www.codetriage.com/bluet/anyroute.js)  
[![npm version](https://img.shields.io/npm/v/anyroute.svg)](https://www.npmjs.org/package/anyroute)
[![install size](https://packagephobia.now.sh/badge?p=anyroute)](https://packagephobia.now.sh/result?p=anyroute)
[![npm downloads](https://img.shields.io/npm/dm/anyroute.svg)](http://npm-stat.com/charts.html?package=anyroute)
[![GitHub license](https://img.shields.io/github/license/BlueT/anyroute.js.svg)](https://github.com/BlueT/anyroute.js/blob/master/LICENSE)

# anyroute - lightweight router works anywhere
A flexible lightweight router you can use in nodejs and browser. No dependency.

# INSTALL

`npm i anyroute`

Or find help from:
- https://www.npmjs.com/package/anyroute
- https://github.com/BlueT/anyroute.js

## SYNOPSIS

~~~~ js
const {Anyroute, MatchResult} = require('anyroute');
const anyroute = new Anyroute;

anyroute.set('/happy/:foo/and/:bar', (params) => { console.log("Happy " + params.foo + " and " + params.bar ); return params.foo + params.bar; });

let foobar = anyroute.get('/happy/trees/and/kitties').run();
// Happy trees and kitties
// foobar: treeskitties

anyroute.set('/:aaa/:bbb', (match) => {return match;})
        .get('/doraemon/superman')
        .run({'c':'c'}, (result) => console.log(result));
// { 'aaa': 'doraemon', 'bbb': 'superman', 'c': 'c' }

anyroute.notfound(function (matchResult) {
        // call when NO exact match found
        // matchResult is an MatchResult Object
        return matchResult.payload.foo + matchResult.payload.and;
});
~~~~


## Setter

Define a route and placeholder.
Returns error (if any), the handler been set, and an empty payload.

~~~~ js
function handler () {};
function handler_post () {};

anyroute.set('/collection/:cid/tab/:tabID', handler);
// If no feat (a tag) has been set, means 'default'.

var ret = anyroute.set('/collection/:cid/tab/:tabID', handler, 'default');
// When a handler of a feat has previously been set,
// it'll overwrite with the new, and return a message in err.
// Returns modified anyroute itself, too.

var ret = anyroute.set('/collection/:cid/tab/:tabID/', handler_post, 'post')
// feat can be anything, just like a tag
~~~~


## Getter

~~~~ js
var ret = anyroute.get('/collection/123/tab/456');
// If no feat (a tag) has been set, means 'default'.
// Returns MatchResult object

var ret = anyroute.get('/collection/ccc/tab/ttt', {user: 'keroro'});
// You can put user's payload, and they'll be merged into one in return.
// Custom payload with the same name will be override by get().
// ret.payload: { user: 'keroro', cid: 'ccc', tabID: 'ttt' }

var ret = anyroute.get('/collection/foo/tab/bar', {cid: 'admin'}, 'all');
// Also the 'all' means return all handlers from all feats.
// ret.handler: 
//    { default: [Function: handler],
//      post: [Function: handler_post] }

var ret = anyroute.get('/collection/abc/tab/xyz', {}, 'head');
// Getting handler of a feat you've never set before,
// will return the default handler, with a error message.
// So you can have the fallback if you want.
~~~~

### run() shortcut
Call with _run([object?: payload, function?: callback])_

`run()` is a shortcut of `MatchResult.handler( MatchResult.payload )`.

`run(callback)` is a shortcut of `callback( MatchResult.run() );`.

Also can do `run(additionalParams)` and `run(additionalParams, callback)`.

~~~~ js
var result = ar.get("/collection/:cid/tab/:tabID").run();

var ret = ar.get("/collection/:cid/tab/:tabID", {}, "default");
let returnedByHandler = ret.run(req.body.data);
// also can have custom payload here as first argument
// similar to ret.handler(ret.payload)

let cid = ret.run({foo: bar}, (x) => x.cid);
let tab = ret.run((x) => x.tabID);
// additional processing on data returned by pre-set handler
~~~~

Before calling `run()`, you can set `.notfound(handleNotFound)` handler, which will be called if err occurred (path not found).

Function _handleNotFound_ will be called with _MatchResult_ as input parameter. `handleNotFound(MatchResult)`.

~~~~ js
// setup `notfound` handler
anyroute.notfound(function (matchResult) {
        // call when NO exact match found
        // matchResult is an MatchResult Object
        return matchResult.payload.foo + matchResult.payload.bar;
});
~~~~

### MatchResult
~~~~ js
MatchResult {
  err: undefined,
  handler: [Function: handler],
  payload: { foo: 'forty', bar: 'bobs', and: 'adam' },
  default: undefined }
~~~~
