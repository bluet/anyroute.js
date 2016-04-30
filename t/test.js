var anyroute = require('../index.js');
var ar = new anyroute;

function handler1 () {};
ar.set('/collection/:cid/tab/:tabID', handler1);

function handler2 () {};
ar.set('/collection/:cid/tab/:tabID/', handler2, 'post')

ar.get('/collection/:cid/tab/:tabID');
ar.get('/collection/:cid/tab/:tabID', 'default');
ar.get('/collection/:cid/tab/:tabID', 'all');
