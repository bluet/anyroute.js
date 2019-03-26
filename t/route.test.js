"use strict";
var test = require("tape"); // assign the tape library to the variable "test"
var appRoot = require("app-root-path");
var Anyroute = require(appRoot + "/index.js");

var ar = new Anyroute;

function handler_default () {}
function handler_post () {}

//~ var ret = ar.set('/collection/:cid/tab/:tabID', handler_default);
//~ console.log(ret);
test("set default handler to placeholder", function (t) {
	var ret = ar.set("/collection/:cid/tab/:tabID", handler_default);
	t.equal(ret.err, undefined);
	t.equal(ret.handler.name, "handler_default");
	t.deepEqual(ret.payload, {});
	t.end();
});
//~ { err: undefined,
//~ handler: [Function: handler_default],
//~ payload: {} }


//~ var ret = ar.set('/collection/:cid/tab/:tabID', handler_default, 'default');
//~ console.log(ret);
test("set default handler to placeholder, speficying method \"default\". Replacing previous.", function (t) {
	var ret = ar.set("/collection/:cid/tab/:tabID", handler_default, "default");
	t.equal(ret.err, "handler already exist. Replacing.");
	t.equal(ret.handler.name, "handler_default");
	t.deepEqual(ret.payload, {});
	t.end();
});
//~ { err: 'handler already exist. Replacing.',
//~ handler: [Function: handler_default],
//~ payload: {} }


//~ var ret = ar.set('/collection/:cid/tab/:tabID/', handler_post, 'post')
//~ console.log(ret);
test("set default handler to placeholder, speficying method \"post\".", function (t) {
	var ret = ar.set("/collection/:cid/tab/:tabID/", handler_post, "post");
	t.equal(ret.err, undefined);
	t.equal(ret.handler.name, "handler_post");
	t.deepEqual(ret.payload, {});
	t.end();
});
//~ { err: undefined,
//~ handler: [Function: handler_post],
//~ payload: {} }


//~ console.log('--------------------');

//~ var ret = ar.get('/collection/123/tab/456');
//~ console.log(ret);
test("get default handler and payload from a path.", function (t) {
	var ret = ar.get("/collection/123/tab/456");
	t.equal(ret.err, undefined);
	t.equal(ret.handler.name, "handler_default");
	t.deepEqual(ret.payload, { cid: "123", tabID: "456" });
	t.end();
});
//~ { err: undefined,
//~ handler: [Function: handler_default],
//~ payload: { cid: '123', tabID: '456' } }



//~ var ret = ar.get('/collection/:cid/tab/:tabID', {}, 'default');
//~ console.log(ret);
test("get default handler and payload from a path.", function (t) {
	var ret = ar.get("/collection/:cid/tab/:tabID", {}, "default");
	t.equal(ret.err, undefined);
	t.equal(ret.handler.name, "handler_default");
	t.deepEqual(ret.payload, { cid: ":cid", tabID: ":tabID" });
	t.end();
});
//~ { err: undefined,
//~ handler: [Function: handler_default],
//~ payload: { cid: ':cid', tabID: ':tabID' } }



//~ var ret = ar.get('/collection/CCC:ccc/tab/Tab:tabID', {user: 'keroro'}, 'post');
//~ console.log(ret);
test("get post method handler and payload from a path.", function (t) {
	var ret = ar.get("/collection/CCC:ccc/tab/Tab:tabID", {user: "keroro"}, "post");
	t.equal(ret.err, undefined);
	t.equal(ret.handler.name, "handler_post");
	t.deepEqual(ret.payload, { user: "keroro", cid: "CCC:ccc", tabID: "Tab:tabID" });
	t.end();
});
//~ { err: undefined,
//~ handler: [Function: handler_post],
//~ payload: { user: 'keroro', cid: 'CCC:ccc', tabID: 'Tab:tabID' } }



//~ var ret = ar.get('/collection/foo/tab/bar', {cid: 'admin'}, 'all');
//~ console.log(ret);
test("get all handlers and payload from a path.", function (t) {
	var ret = ar.get("/collection/foo/tab/bar", {cid: "admin"}, "all");
	t.false(ret.err);
	t.equal(ret.handler.default.name, "handler_default");
	t.equal(ret.handler.post.name, "handler_post");
	t.deepEqual(ret.payload, { cid: "foo", tabID: "bar" });
	t.end();
});
//~ { err: undefined,
//~ handler: 
//~ { default: [Function: handler_default],
//~ post: [Function: handler_post] },
//~ payload: { cid: 'foo', tabID: 'bar' } }



//~ var ret = ar.get('/collection/abc/tab/xyz', {}, 'head');
//~ console.log(ret);
test("get head method handler and payload from a path. No match so return error and default handler.", function (t) {
	var ret = ar.get("/collection/abc/tab/xyz", {}, "head");
	t.equal(ret.err, "not found");
	t.equal(ret.handler.name, "handler_default");
	t.deepEqual(ret.payload, { cid: "abc", tabID: "xyz" });
	t.end();
});
//~ { err: 'not found',
//~ handler: [Function: handler_default],
//~ payload: { cid: 'abc', tabID: 'xyz' } }
