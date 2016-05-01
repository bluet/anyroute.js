# anyroute.js
A flexable lightweight router you can use in nodejs and browser. No dependency.

## require
```
var anyroute = require('anyroute');
var ar = new anyroute;
```

## Setter
```
function handler_default () {};
function handler_post () {};

var ret = ar.set('/collection/:cid/tab/:tabID', handler_default);
console.log(ret);
// { err: undefined,
//   handler: [Function: handler_default],
//   payload: {} }

var ret = ar.set('/collection/:cid/tab/:tabID', handler_default, 'default');
console.log(ret);
// { err: 'handler already exist. Replacing.',
//   handler: [Function: handler_default],
//   payload: {} }


var ret = ar.set('/collection/:cid/tab/:tabID/', handler_post, 'post')
console.log(ret);
// { err: undefined,
//   handler: [Function: handler_post],
//   payload: {} }
```

## Getter
```
var ret = ar.get('/collection/:cid/tab/:tabID');
console.log(ret);
// { err: undefined,
//   handler: [Function: handler_default],
//   payload: { cid: ':cid', tabID: ':tabID' } }

var ret = ar.get('/collection/123/tab/456', 'default');
console.log(ret);
// { err: undefined,
//   handler: [Function: handler_default],
//   payload: { cid: '123', tabID: '456' } }

var ret = ar.get('/collection/CCC:ccc/tab/Tab:tabID', 'post');
console.log(ret);
// { err: undefined,
//   handler: [Function: handler_post],
//   payload: { cid: 'CCC:ccc', tabID: 'Tab:tabID' } }

var ret = ar.get('/collection/foo/tab/bar', 'all');
console.log(ret);
// { err: undefined,
//   handler: 
//    { default: [Function: handler_default],
//      post: [Function: handler_post] },
//   payload: { cid: 'foo', tabID: 'bar' } }
```
