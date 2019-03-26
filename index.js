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
 * var ar = new anyroute;
 * 
 * function handler1 () {};
 * ar.set('/collection/:cid/tab/:tabID', handler1);
 * ar.get('/collection/:cid/tab/:tabID');
 * 
 * function handler2 () {};
 * ar.set('/collection/:cid/tab/:tabID/', handler2);
*/


/*
Example: /collection/:cid/tab/:tabID
Path: anyroute.path.collection.PLACEHOLDER.tab.PLACEHOLDER
Structure:
var anyroute = {
	path: {
		handler: function() {},
		collection: {
			handler: function() {},
			var_name: 'cid'
			'PLACEHOLDER': {
				handler: function() {},
				tab: {
					handler: function() {},
					var_name: 'tabID'
					'PLACEHOLDER': {
						handler: function() {}
					}
				}
			}
		}
	}
}
*/


function anyroute() {
	//~ var self = this;
	this.path = undefined;
	this.pool = {};
}


/*
 * 
 * name: set
 * @param {String} path - The path
 * @param {Function} handler - Handler for the Path
 * @returns {String} err
 * @returns {Function} handler
 * 
 */
anyroute.prototype.set = function(path, handler, feat) {
	var layers = [];
	var payload = {};
	feat = feat || "default";
	path = path.trim();
	
	if (feat === "all") {
		return ({err: "reserved keyword in feat: " + feat + ". Please use \"default\" instead."});
	}
	
	path.split("/").forEach(function(layer){
		if (layer.match("^handler$") || layer.match("^PLACEHOLDER$") || layer.match("^var_name$")) {
			return ({err: "reserved keyword in path: " + layer});
		}
		
		layers.push(layer);
	});
	
	//~ console.log('Final layers: ', layers);
	
	var ret = leaf(this.pool, layers, payload, feat, handler);
	//~ console.log('Set into Routing pool - result: ', ret)
	return ret;
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
anyroute.prototype.get = function(path, payload, feat) {
	var layers = [];
	payload = payload || {};
	feat = feat || "default";
	path = path.trim();
	
	path.split("/").forEach(function(layer){
		if (layer.match("^handler$") || layer.match("^PLACEHOLDER$") || layer.match("^var_name$")) {
			return ({err: "reserved keyword in path: " + layer});
		}
		
		layers.push(layer);
	});
	
	//~ console.log('Final layers: ', layers);
	
	var ret = leaf(this.pool, layers, payload, feat);
	//~ console.log('Get from Routing pool - result: ', ret)
	return ret;
};


/*
 * 
 * name: leaf
 * @param {Object} node - Root node
 * @param {Array} layers - Layers of path
 * @param {Object} payload - Current payload
 * @param {Function} [handler=] - Handler for the Path
 * @returns {String} err
 * @returns {Object} payload
 * @returns {Function} handler
 * 
 */
// return err === 'not found' if there's no handler yet
function leaf (node, layers, payload, feat, handler) {
	//~ var self = this;
	var ret = {
		"err": undefined,
		"handler": undefined,
		"payload": undefined
	};
	
	if (handler && typeof(handler) != "function") {
		ret.err = "handler should be a function";
		return ret;	// error
	}
	
	// remove empty layer
	var tmp_next_layer_name = layers[0];
	if (tmp_next_layer_name) {
		tmp_next_layer_name = tmp_next_layer_name.replace(/^:+/, "");
	}
	while (tmp_next_layer_name === "") {
		layers.shift();
		
		tmp_next_layer_name = layers[0];
		if (tmp_next_layer_name) {
			tmp_next_layer_name = tmp_next_layer_name.replace(/^:+/, "");
		}
	}
	
	//~ console.log('Entered Node');
	
	if (layers.length === 0) {	// leaf node
		//~ console.log('In leaf Node*');
		
		if (handler) {		// .set
			if (typeof(node.handler) === "undefined") {
				node.handler = {};
			}
			if (node.handler[feat]) {
				ret.err = "handler already exist. Replacing.";
			}
			node.handler[feat] = handler;
		} else {
			if (feat === "all") {
				if (typeof(node.handler) === "undefined") {
					ret.err = "not found";
				}
			} else {
				if (typeof(node.handler[feat]) != "function") {
					ret.err = "not found";
					if (node.handler["default"]) {
						feat = "default";
					}
				}
			}
		}
		
		if (feat === "all") {
			ret.handler = node.handler;
		} else {
			ret.handler = node.handler[feat];
		}
		ret.payload = payload;
		
		return ret;	// found
	} else {			// recurring
		var next_layer = layers.shift();
		//~ console.log('Next Layer: ', next_layer);
		
		if (next_layer.match(/^:/) && handler) {	// PLACEHOLDER in .set
			next_layer = next_layer.replace(/^:+/, "");
			node["var_name"] = next_layer;
			next_layer = "PLACEHOLDER";
			//~ console.log('Set PLACEHOLDER');
		}
		
		if (! node.hasOwnProperty(next_layer)) {
			//~ console.log('No Path Matched!');
			if (handler) {			// .set
				//~ console.log('Create new Node');
				node[next_layer] = {};
			} else if (node.hasOwnProperty("PLACEHOLDER")) {	// .get
				payload[node.var_name] = next_layer;
				next_layer = "PLACEHOLDER";
				//~ console.log('Get PLACEHOLDER');
			} else {
				ret.err = "not found";
				
				return ret;	// error
			}
		}
		
		ret = leaf(node[next_layer], layers, payload, feat, handler);
		
		if (ret.handler) {
			return ret;
		} else {		// .get and fallback
			ret.handler = node.handler;
			//~ console.log('FALLBACK!');
			
			return ret;
		}
		
	}
	
}


module.exports = anyroute;
