[![Build Status](https://travis-ci.org/BlueT/anyroute.js.svg?branch=master)](https://travis-ci.org/BlueT/anyroute.js) [![Quality Gate](https://sonarqube.com/api/badges/gate?key=anyroute)](https://sonarqube.com/dashboard/index/anyroute)

# anyroute.js
A flexable lightweight router you can use in nodejs and browser. No dependency.

## require
~~~~ js
var anyroute = require('anyroute');
var ar = new anyroute;
~~~~

## Setter
Define a route and placeholder.
Returns error (if any), the handler been set, and an empty payload.
~~~~ js
function handler_default () {};
function handler_post () {};

// If no feat (a tag) has been set, means 'default'.
var ret = ar.set('/collection/:cid/tab/:tabID', handler_default);

console.log(ret);
// { err: undefined,
//   handler: [Function: handler_default],
//   payload: {} }


// When a handler of a feat has previously been set,
// it'll overwrite with the new, and return a message in err.
var ret = ar.set('/collection/:cid/tab/:tabID', handler_default, 'default');

console.log(ret);
// { err: 'handler already exist. Replacing.',
//   handler: [Function: handler_default],
//   payload: {} }


// feat can be anything, just like a tag
var ret = ar.set('/collection/:cid/tab/:tabID/', handler_post, 'post')

console.log(ret);
// { err: undefined,
//   handler: [Function: handler_post],
//   payload: {} }
~~~~

## Getter
~~~~ js
// If no feat (a tag) has been set, means 'default'.
var ret = ar.get('/collection/123/tab/456');

console.log(ret);
// { err: undefined,
//   handler: [Function: handler_default],
//   payload: { cid: '123', tabID: '456' } }


// The ':' prefix won't break the .get
var ret = ar.get('/collection/:cid/tab/:tabID', {}, 'default');

console.log(ret);
// { err: undefined,
//   handler: [Function: handler_default],
//   payload: { cid: ':cid', tabID: ':tabID' } }


// You can put user's payload, and they'll be merged into one in return.
var ret = ar.get('/collection/CCC:ccc/tab/Tab:tabID', {user: 'keroro'}, 'post');

console.log(ret);
// { err: undefined,
//   handler: [Function: handler_post],
//   payload: { user: 'keroro', cid: 'CCC:ccc', tabID: 'Tab:tabID' } }


// User's payload with the same name will be overwrited, for security,
// so you won't get hurt by bad guys.
// Also the 'all' means return all handlers from all feats.
var ret = ar.get('/collection/foo/tab/bar', {cid: 'admin'}, 'all');

console.log(ret);
// { err: undefined,
//   handler: 
//    { default: [Function: handler_default],
//      post: [Function: handler_post] },
//   payload: { cid: 'foo', tabID: 'bar' } }


// Getting handler of a feat you've never set before,
// will return the default handler, with a error message.
// So you can have the fallback if you want.
var ret = ar.get('/collection/abc/tab/xyz', {}, 'head');

console.log(ret);
// { err: 'not found',
//   handler: [Function: handler_default],
//   payload: { cid: 'abc', tabID: 'xyz' } }
~~~~

### run() shortcut
`run()` is a shortcut of `handler(payload)`. Returns the returned value of `handler(payload)`.

`run(callback)` is a shortcut of `let tmp = handler(payload); callback(tmp);`. Returns the returned value of `callback(tmp)`.

~~~~ js
var ret = ar.get("/collection/:cid/tab/:tabID", {}, "default");

let returnedByHandler = ret.run();      // same as  ret.handler(ret.payload)

ret.run((input) => console.log("callback in run(): " + JSON.stringify(input, null, 4)));
// same as
// let returnedByHandler = ret.handler(ret.payload);
// console.log("callback in run(): " + JSON.stringify(returnedByHandler, null, 4));
~~~~