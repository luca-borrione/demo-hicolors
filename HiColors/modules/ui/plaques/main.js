define(function(require, exports, module) {
	"use strict";
	
	var loseSummary = require("./loseSummary"),
		winSummary = require("./winSummary");
	
	function create() {
		loseSummary.create();
		winSummary.create();
	}
	
	function setParams(params) {
		loseSummary.setParams(params);
		winSummary.setParams(params);
	}
	
	module.exports = {
		create: create,
		loseSummary: loseSummary,
		setParams: setParams,
		winSummary: winSummary
	};
});