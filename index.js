/*
 * anyroute - A flexible router you can use in nodejs and browser.
 *
 * Copyright (c) 2016, BlueT - Matthew Lien - 練喆明
 *
 * Author: BlueT - Matthew Lien - 練喆明 <BlueT@BlueT.org>
 * First Release Date: 2016-04-30
 */

/*
 * SYNOPSIS
 *
 * const {Anyroute, MatchResult} = require('anyroute');
 * const anyroute = new Anyroute;
 *
 * anyroute.set('/happy/:foo/and/:bar', (params) => { console.log("Happy " + params.foo + " and " + params.bar ); return params.foo + params.bar; });
 *
 * let foobar = anyroute.get('/happy/trees/and/kitties').run();
 * // Happy trees and kitties
 * // foobar: treeskitties
 *
 * anyroute.set('/:aaa/:bbb', (match) => {return match;})
 *         .get('/doraemon/superman')
 *         .run({'c':'c'}, (result) => console.log(result));
 * // { 'aaa': 'doraemon', 'bbb': 'superman', 'c': 'c' }
 *
 * anyroute.notfound(function (matchResult) {
 *         // call when NO exact match found
 *         // matchResult is an MatchResult Object
 *         return matchResult.payload.foo + matchResult.payload.and;
 * });
 */

/*
 * Example: /collection/:cid/tab/:tabID
 * Path: anyroute.path.collection.PLACEHOLDER.tab.PLACEHOLDER
 * Structure:
 * var anyroute = {
 * 	pool: {
 * 		handler: function() {},
 * 		collection: {
 * 			handler: function() {},
 * 			var_name: 'cid'
 * 			'PLACEHOLDER': {
 * 				handler: function() {},
 * 				tab: {
 * 					handler: function() {},
 * 					var_name: 'tabID'
 * 					'PLACEHOLDER': {
 * 						handler: function() {}
 * 					}
 * 				}
 * 			}
 * 		}
 * 	}
 * }
*/

function Anyroute (params = {}) {
	//~ var self = this;
	this.default = params.default;
	// this.path = params.path;
	this.pool = params.pool || {};
}


/*
 *
 * name: default
 * @param {Function} handler - Handler if no matching path
 * @returns {Object} Anyroute
 *
 */
Anyroute.prototype.notfound = function (handler) {
	this.default = typeof(handler) === "function" ? handler : function () { return handler; };
	return this;
};


/*
 *
 * name: set
 * @param {String} path - The path
 * @param {Function} handler - Handler for the Path
 * @returns {String} err
 * @returns {Function} handler
 *
 */
Anyroute.prototype.set = function (path, handler, feat) {
	let layers = [];
	let payload = {};
	feat = feat || "default";
	path = path.trim();

	if (feat === "all") {
		return {
			"err":
				"reserved keyword in feat: "
				+ feat
				+ ". Please use \"default\" instead.",
		};
	}

	layers = path_parser(path);

	//~ console.log('Final layers: ', layers);

	let ret = leaf(this.pool, layers, payload, feat, handler);
	return Object.assign(this, ret);
};

/*
 *
 * name: get
 * @param {String} path - The path
 * @returns {String} err
 * @returns {Object} payload
 * @returns {Function} handler
 *
 */
Anyroute.prototype.get = function (path, payload, feat) {
	let layers = [];
	payload = payload || {};
	feat = feat || "default";
	path = path.trim();

	layers = path_parser(path);

	// console.log('Final layers: ', layers);

	let ret = leaf(this.pool, layers, payload, feat);
	ret.default = this.default;
	// console.log('Get from Routing pool - result: ', ret)

	return new MatchResult(ret);
};


function path_parser (path) {
	let layers = [];
	path.split("/").forEach((layer) => {
		if (
			layer.match("^handler$")
			|| layer.match("^PLACEHOLDER$")
			|| layer.match("^var_name$")
		) {
			return { "err": "reserved keyword in path: " + layer };
		}

		layers.push(layer);
	});
	return layers;
}


/*
 *
 * name: leaf
 * @param {Object} node - Root node
 * @param {Array} layers - Layers of path
 * @param {Object} payload - Current payload
 * @param {Function} [handler=] - Handler for the Path
 * @returns {String} err - return err === 'not found' if there's no handler yet
 * @returns {Object} payload
 * @returns {Function} handler
 *
 */

// Refactor this function to reduce its Cognitive Complexity from 67 to the 15 allowed. [+33 locations]
function leaf (node, layers, payload, feat, handler) {
	let ret = {};

	if (handler && typeof handler != "function") {
		ret.err = "handler should be a function";
		return ret; // error
	}

	// remove empty layer

	let tmp_next_layer_name = "";
	while (tmp_next_layer_name === "") {
		layers.shift();

		tmp_next_layer_name = layers[0];
		if (tmp_next_layer_name) {
			tmp_next_layer_name = tmp_next_layer_name.replace(/^:+/, "");
		}
	}

	// Entered Node

	if (layers.length === 0) {
		// leaf node

		if (handler) {
			// .set
			if (typeof node.handler === "undefined") {
				node.handler = {};
			}
			node.handler[feat] = handler;
		} else {
			// .get
			if (feat === "all") {
				if (typeof node.handler === "undefined") {
					ret.err = "not found";
				}
			} else {
				if (!node.handler || typeof node.handler[feat] != "function") {
					ret.err = "not found";
					if (node.handler && node.handler["default"]) {
						feat = "default";
					}
				}
			}
		}

		if (node.handler) {
			// has handler for current path
			if (feat === "all") {
				ret.handler = node.handler;
			} else {
				ret.handler = node.handler[feat];
			}
		}

		ret.payload = payload;

	} else {
		// recurring
		let next_layer = layers.shift();

		if (next_layer.match(/^:/) && handler) {
			// PLACEHOLDER in .set
			next_layer = next_layer.replace(/^:+/, "");
			node["var_name"] = next_layer;
			next_layer = "PLACEHOLDER";
			//~ console.log('Set PLACEHOLDER');
		}

		if (Object.prototype.hasOwnProperty.call(node, next_layer)) {
			ret = leaf(node[next_layer], layers, payload, feat, handler);
		} else {
			//~ console.log('No Path Matched!');
			if (handler) {
				// .set
				//~ console.log('Create new Node');
				node[next_layer] = {};
				ret = leaf(node[next_layer], layers, payload, feat, handler);
			} else if (Object.prototype.hasOwnProperty.call(node, "PLACEHOLDER")) {
				// .get and set value to placeholder var
				payload[node.var_name] = next_layer;
				next_layer = "PLACEHOLDER";
				//~ console.log('Get PLACEHOLDER');
				ret = leaf(node[next_layer], layers, payload, feat, handler);
			} else {
				ret.err = "not found";
			}
		}


		if (!ret.handler) {
			// .get and fallback
			// console.log('FALLBACK!');
			if (node.handler) {
				ret.handler = node.handler[feat] ? node.handler[feat] : node.handler["default"];
			} else if (node.PLACEHOLDER && node.PLACEHOLDER.handler) {
				ret.handler = node.PLACEHOLDER.handler[feat] ? node.PLACEHOLDER.handler[feat] : node.PLACEHOLDER.handler["default"];
			}

			ret.payload = ret.payload ? ret.payload : payload ;
		}
	}

	// console.log(ret);
	return ret;
}


function MatchResult (ret = {}) {
	this.err = ret.err;
	this.handler = ret.handler;
	this.payload = ret.payload;
	this.default = ret.default;

	return this;
}

MatchResult.prototype.run = function (params, cb) {

	// only cb
	if (typeof params === "function") {
		cb = params;
		params = undefined;
	}

	if (typeof params === "object") {
		Object.entries(params).forEach(([key, value]) => {
			if (!this.payload[key]) {
				this.payload[key] = value;
			}
		});
	}

	// console.log(this);

	if (this.err) {
		return typeof(this.default) === "function" ? this.default(this) : this;
	}

	let result = this.handler(this.payload);

	if (cb && typeof cb === "function") {
		return cb(result);
	}

	return result;
};

Anyroute.prototype.MatchResult = MatchResult;

module.exports = Anyroute;
module.exports.Anyroute = Anyroute;
module.exports.MatchResult = MatchResult;
