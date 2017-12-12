/**
 * @module messageObserver
 * @description
 * Listens to custom messages and executes a callback once that all the bounded messages have been posted.
 * Currently the callback can be executed only once. If the same callback needs to be executed every time
 * that certain messages have been posted, then the request needs to be defined again once it's fullfilled.
 * @example
 * postRequest(["a","b","c"], function(){ ... });	// defines the callback to be executed once that all the "a", "b" and "c" events have been triggered
 * postMessage("a", "x", "y");						// triggers the "a" event and passes the aguments "x" and "y" to the callback function 
 * @version: 2.9
 * @lastModified: 08 December 2017
 */

define(function(require, exports, module) {
	"use strict";
	
	// var debug = require("./submodules/requirejs-debug/main");

	/**
	 * Collestion of all the requested custom event ids
	 * @type {Array.<String>}
	 */
	var requestedIds = [];

	/**
	 * Contains the information associated with a certain message (notification).
	 * @typedef {Object} message
	 * @property {String} id - the unique identifier of the message. You can use special characters as well
	 * @property {(Array|Object)} args - arguments to pass to the callback function
	 */
	
	/**
	 * Max length of the message log
	 * @type {number}
	 */
	var _messageLogSize = 20;
	
	/**
	 * Collection of the latest posted messages. It may be useful for debugging purposes.
	 * @type {Array.<message>}
	 * @private
	 */
	var _messageLog = [];

	/**
	 * The callback function to execute once that all the messages have been triggered for a certain request.
	 * @callback requestCallback
	 * @param {Object} args - arguments passed via the postMessage method and listed associated with the correspondent message id
	 */
	
	/**
	 * Contains the information associated with a certain request.
	 * @typedef {Object} Request
	 * @property {Array.<String>} ids - the ids of the message that the observer needs to wait before triggering the callback.
	 * @property {requestCallback} callback
	 */
	
	/**
	 * Collection of all the requests still waiting for some message to be triggered.
	 * Once that all the messages are triggered, the callback is executed and the request is pulled out from the queue.
	 * @type {Array.<Request>}
	 * @private
	 */
	var _requestQueue = [];

	
	/**
	 * Defines the conditions to be fulfilled before triggering a callback.
	 * @param {Array.<String>} ids - the ids of the messages to wait
	 * @param {requestCallback} callback
	 * @returns {boolean} - true if the request has been successfully created
	 */
	function postRequest(ids, callback) {
		var idsAlreadyRequested = [],
			id_array, i, id, _requestQueueClone, r, req;

		// checking and validating the ids argument
		if (Object.prototype.toString.call(ids) === "[object Array]") {
			id_array = ids;
		} else if (typeof ids === "string") {
			id_array = [ids];
		} else {
			console.error("bad scheduler request: ", ids, Object.prototype.toString.call(ids));
			return false;
		}

		// only strings are allowed in the ids
		for (i = 0; i < id_array.length; i++) {
			id = id_array[i];
			if (typeof id === "string") {
				requestedIds.push(id);
			} else {
				console.error("string expected, found ", id, "["+typeof id+"]");
				return false;
			}
		}

		// checking whether a request with the same ids has been already defined. In this case the operation will be aborted
		_requestQueueClone = _requestQueue.slice(0);
		for (r = 0; r < _requestQueueClone.length; r++) {
			req = _requestQueueClone[r];
			for (i = 0; i < id_array.length; i++) {
				id = id_array[i];
				if (req.ids.indexOf(id) !== -1) {
					idsAlreadyRequested.push(id);
				}
			}

			// Request already set for the given ids
			if (id_array.length === idsAlreadyRequested.length && id_array.length === req.ids.length) {
				return false;
			}
		}

		_requestQueue.push({ids: id_array, callback: callback}); // pushing the request to the queue

		// debug.console.info("new postRequest");
		// debug.console.log(id_array);

		return true;
	}

	
	/**
	 * Posts a specific message.
	 * It can also stores arguments to pass to the request callback function when it will be executed.
	 * @param {String} id - message identification
	 * @param {...number} [var_args] -	optional arguments to apply to the request callback function.
	 * 									They can be listed as multiple arguments args1, args2, ...
	 * 									or using just one argument as an associative array {key1:args1, key2:args2, ...}
	 * @returns {boolean} - true if the message has been posted successfully
	 */
	function postMessage(id, var_args) {
		var args, message;
		
		// validating the id
		if (typeof id !== "string") {
			console.error("string expected, found", id,  "["+typeof id+"]");
			return false;
		}
		
		// preparing the arguments to be passed to the request callback function.
		// If multiple arguments have been specified, then these will be stored in an array
		// If only a single associative array has been specified, then this will be applied as it is to the callback
		args = Array.prototype.slice.call(arguments);
		args.shift();
		if (args.length === 1 && Object.prototype.toString.call(args[0]) === "[object Object]") {
			args = args[0];
		}

		// no request has been defined for this message id - aborting
		if (requestedIds.indexOf(id) === -1) {
			// debug.console.warn("posting a message using a non-requested id: " + id);
			return false;
		}

		message = {id: id, args: args};
		// debug.console.info("message posted: "+id);
		
		// keeping track of the message in the log
		_messageLog.push(message);
		if (_messageLog.length > _messageLogSize) {
			_messageLog.shift();
		}

		_checkRequests(message);
		return true;
	}

	
	/**
	 * It verifies if all the messages for a certain request have been posted.
	 * If this is the case it triggers the request callback function.
	 * @param {message} message
	 * @private
	 */
	function _checkRequests(message) {
		var msgIndex;

		//Check the message against the request queue
		_requestQueue.slice(0).forEach(function(request, i){
			msgIndex = request.ids.indexOf(message.id);
			if (msgIndex === -1) {
				return; // the current request is not associated with this particular message - aborting
			}
			// preparing the arguments to apply to the callback
			if (typeof request.args === "undefined") {
				request.args = {};
			}
			if (typeof message.args !== "undefined") {
				request.args[message.id] = message.args;
			}
			request.ids.splice(msgIndex, 1); // removing the message id from the ids associated with the request
			if (request.ids.length === 0) { //request has received all required messages
				// debug.console.log("all messages received: executing request callback");
				request.callback.apply(this, [request.args]); //fire the request callback
				_requestQueue.shift(); // pull the request out from the queue
			}
		});
	}

	
	/**
	 * Gives the possibility to drop a certain request before all its conditions are fulfilled.
	 * @param {Array.<String>} ids - the ids of the messages used to define the request to be dropped
	 * @returns {boolean} - true if the request has been dropped successfully 
	 */
	function dropRequest(ids) {
		var matchingIds = [],
			requestQueue = [],
			id_array;

		// checking and validating the ids argument
		if (Object.prototype.toString.call(ids) === "[object Array]") {
			id_array = ids;
		} else if (typeof ids === "string") {
			id_array = [ids];
		} else {
			console.error("bad scheduler request: ", ids, Object.prototype.toString.call(ids));
			return false;
		}

		_requestQueue.slice(0).forEach(function(request){
			// store the matching ids
			id_array.forEach(function(id){
				if (request.ids.indexOf(id) !== -1) {
					matchingIds.push(id);
				}
			});

			// This request needs to drop
			if (id_array.length === matchingIds.length && id_array.length === request.ids.length) {
				return;
			}
			requestQueue.push(request); // keeping this one
		});
		
		_requestQueue = requestQueue; // replace the private reference
		return true;
	}

	
	/**
	 * Returns the message log. It may be useful for debugging purposes.
	 * @returns {Array.<message>}
	 */
	function getMessageLog() {
		return _messageLog;
	}


	/**
	 * Defines how big the message log should be.
	 * @param {Number} messageLogSize
	 */
	function setMessageLogSize(messageLogSize) {
		if (typeof messageLogSize === "number" && messageLogSize > 0) {
			_messageLogSize = messageLogSize;
		}
	}

	/**
	 * Returns the collection of all the message ids that are associated with a request
	 * @returns {Array.<String>}
	 */
	function getRequestedIds() {
		return requestedIds;
	}

	module.exports = {
		dropRequest: dropRequest,
		getRequestedIds: getRequestedIds,
		getMessageLog: getMessageLog,
		postMessage: postMessage,
		postRequest: postRequest,
		setMessageLogSize: setMessageLogSize
	};
});