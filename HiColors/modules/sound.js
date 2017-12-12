define(function(require, exports, module) {
	"use strict";
	
	var game,
		initialised = false,
		sfx = {};
	
	function preload() {
		game.load.audio("bgMusic", "assets/audio/bgmusic-loop.mp3");
		game.load.audio("crunch", "assets/audio/crunch.mp3");
		game.load.audio("failure", "assets/audio/failure.mp3");
		game.load.audio("loseSummary", "assets/audio/loseSummary.mp3");
		game.load.audio("loseSummaryLoop", "assets/audio/loseSummary-loop.mp3");
		game.load.audio("splat", "assets/audio/splat.mp3");
		game.load.audio("success", "assets/audio/success1.mp3");
		game.load.audio("winSummary", "assets/audio/winSummary.mp3");
		game.load.audio("winSummaryLoop", "assets/audio/winSummary-loop.mp3");
	}
	
	function setParams(params) {
		params = params || {};
		game = params.game || game;
	}
	
	function create() {
		if (initialised) {
			return;
		}
		initialised = true;
		
		Object.assign(sfx, {
			bgMusic: game.add.audio("bgMusic"),
			crunch: game.add.audio("crunch"),
			failure: game.add.audio("failure"),
			loseSummary: game.add.audio("loseSummary"),
			loseSummaryLoop: game.add.audio("loseSummaryLoop"),
			splat: game.add.audio("splat"),
			success: game.add.audio("success"),
			winSummary: game.add.audio("winSummary"),
			winSummaryLoop: game.add.audio("winSummaryLoop")
		});
		sfx.bgMusic.loop = true;
		sfx.bgMusic.volume = 0.2;
	}
	
	function stopAll() {
		for (var key in sfx) {
			if (sfx.hasOwnProperty(key)) {
				sfx[key].stop();
			}
		}
	}
	
	module.exports = {
		create: create,
		preload: preload,
		setParams: setParams,
		sfx: sfx,
		stopAll: stopAll
	};
});