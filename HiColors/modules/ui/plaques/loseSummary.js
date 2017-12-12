define(function(require, exports, module) {
	"use strict";
	
	var bigBall = require("../../displayObjects/bigBall"),
		locale = require("i18n!nls/locale"),
		Phaser = require("Phaser"),
		settings = require("i18n!nls/settings"),
		sound = require("../../sound"),
		utils = require("../../util/utils");
	
	var sfx = sound.sfx,
		game, plaque, self;
	
	function create() {
		var height, radius, shape, square, textObject, width, x, y;
		plaque = game.add.group();
		plaque.alpha = 0.01;
		
		plaque.id = "loseSummary";
		
		radius = 10;
		x = 0;
		y = 0;
		
		// Border
		var border = {
			x: 0,
			y: 0,
			width: game.world.width*(2/3),
			height: game.world.height*(2/3)
		};
		square = new Phaser.RoundedRectangle(border.x, border.y, border.width, border.height, radius);
		shape = game.add.graphics(0, 0);
		shape.alpha = settings.plaque.loseSummary.alpha;
		shape.beginFill(utils.colorToHex(settings.plaque.loseSummary.borderColor), 1);
		shape.drawShape(square);
		shape.endFill();
		plaque.add(shape);
		
		// Bb
		var bg = {
			x: border.x + (settings.plaque.loseSummary.borderDepth/2),
			y: border.y + (settings.plaque.loseSummary.borderDepth/2),
			width: border.width - settings.plaque.loseSummary.borderDepth,
			height: border.height - settings.plaque.loseSummary.borderDepth
		};
		square = new Phaser.RoundedRectangle(bg.x, bg.y, bg.width, bg.height, radius);
		shape = game.add.graphics(0, 0);
		shape.alpha = settings.plaque.loseSummary.alpha;
		shape.beginFill(utils.colorToHex(settings.plaque.loseSummary.bgColor), 1);
		shape.drawShape(square);
		shape.endFill();
		plaque.add(shape);
		
		// Text
		var text = {
			x: (border.width/2),
			y: (border.height/2)
		};
		textObject = game.add.text(text.x, text.y, locale.plaques.loseSummary.message, {
			font: "RobotoRegular",
			fontSize: settings.plaque.loseSummary.fontSize,
			fill: settings.plaque.loseSummary.fontColor,
			stroke: "red",
			strokeThickness: 3,
			align: "center",
			boundsAlignH: "center",
			boundsAlignV: "middle"
		}, plaque);
		// textObject.fixedToCamera = true;
		textObject.anchor.setTo(0.5, 0.5);
		
		plaque.scale.setTo(0.1, 0.1);
		plaque.visible = false;
	}
	
	function show(x,y) {
		x = typeof x === "number" ? x : game.world.centerX;
		y = typeof y === "number" ? y : game.world.centerY;
		sfx.bgMusic.stop();
		sfx.loseSummary.onStop.add(function(){
			sfx.loseSummaryLoop.loop = true;
			sfx.loseSummaryLoop.play();
		});
		sfx.loseSummary.play();

		plaque.visible = true;
		// phaser needs a tick to update the bounds from when the displayObject is visible
		game.time.events.add(Phaser.Timer.QUARTER, function() {
			var pb = plaque.getBounds();
			plaque.x = x - (pb.width / 2);
			plaque.y = y - (pb.height / 2);
			plaque.alpha = 1;
			game.add.tween(plaque.scale).to({x:1, y:1}, 1000, Phaser.Easing.Elastic.Out, true);
			game.add.tween(plaque).to({
				x: x - (5*pb.width),
				y: y - (5*pb.height)
			}, 1000, Phaser.Easing.Elastic.Out, true);
		});
	}
	
	function setParams(params) {
		params = params || {};
		game = params.game || game;
	}
	
	module.exports = {
		create: create,
		setParams: setParams,
		show: show
	};
});