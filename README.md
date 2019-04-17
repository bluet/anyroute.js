[![Build Status](https://travis-ci.org/BlueT/anyroute.js.svg?branch=master)](https://travis-ci.org/BlueT/anyroute.js) [![Quality Gate](https://sonarqube.com/api/badges/gate?key=anyroute)](https://sonarqube.com/dashboard/index/anyroute)

# anyroute.js
A flexable lightweight router you can use in nodejs and browser. No dependency.

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

## require

~~~~ js
const {Anyroute, MatchResult} = require('anyroute');
var anyroute = new Anyroute;
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
`run()` is a shortcut of `handler(payload)`. Returns the returned value of `handler(payload)`.

`run(callback)` is a shortcut of `let tmp = handler(payload); callback(tmp);`. Returns the returned value of `callback(tmp)`.

Call with `run([object?: payload, function?: callback])`

~~~~ js
var result = ar.get("/collection/:cid/tab/:tabID").run();

var ret = ar.get("/collection/:cid/tab/:tabID", {}, "default");
let returnedByHandler = ret.run({req.body.data});
// also can have custom payload here as first argument
// similar to ret.handler(ret.payload)

let cid = ret.run({req.body.data}, (x) => x.cid);
let tab = ret.run((x) => x.tabID);
// additional processing on data returned by pre-set handler
~~~~

If ret.err exist, it calls `notfound` handler with `MatchResult` as input.

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