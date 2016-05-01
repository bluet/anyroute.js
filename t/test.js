var anyroute = require('../index.js');
var ar = new anyroute;

function handler_default () {};
function handler_post () {};

var ret = ar.set('/collection/:cid/tab/:tabID', handler_default);
console.log(ret);

var ret = ar.set('/collection/:cid/tab/:tabID', handler_default, 'default');
console.log(ret);

var ret = ar.set('/collection/:cid/tab/:tabID/', handler_post, 'post')
console.log(ret);

console.log('--------------------');

var ret = ar.get('/collection/123/tab/456');
console.log(ret);

var ret = ar.get('/collection/:cid/tab/:tabID', {}, 'default');
console.log(ret);

var ret = ar.get('/collection/CCC:ccc/tab/Tab:tabID', {user: 'keroro'}, 'post');
console.log(ret);

var ret = ar.get('/collection/foo/tab/bar', {cid: 'admin'}, 'all');
console.log(ret);

var ret = ar.get('/collection/abc/tab/xyz', {}, 'head');
console.log(ret);
