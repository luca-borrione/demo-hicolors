define(function(require, exports, module) {
	"use strict";
	
	var Phaser = require("Phaser"),
		settings = require("i18n!nls/settings"),
		utils = require("../util/utils");
	
	var game, self,
		_flashingColor,
		_flashingLoop;
	
	function create() {
		var cb, chart, color, deltaY, height, hex, padding, radius, sb, shape, square, tb, text, width, x, y;

		// Adding the color chart bg
		// - - - - - - - - - - - - - - - - - - -
		color = settings.colorChart.bgColor;
		hex = utils.colorToHex(color);
		x = 0;
		y = settings.colorChart.y;
		width = settings.world.width;
		height = settings.colorChart.height;
			
		shape = game.add.graphics();
		shape.beginFill(hex, 1);
		shape.drawRect(x, y, width, height);
		shape.endFill();
		
		
		// Adding the color squares
		// - - - - - - - - - - - - - - - - - - -
		chart = game.add.group();
		chart.id = "chart";
		width = settings.colorChart.square.side;
		height = settings.colorChart.square.side;
		radius = settings.colorChart.square.radius;
		padding = settings.colorChart.square.padding;
		
		for (var i = 0; i < settings.colors.length; i++) {
			color = settings.colors[i];
			hex = utils.colorToHex(color);
			x = padding + i*(padding+width+padding);
			y = 0;
			
			// Adding the rounded square to the color chart
			square = new Phaser.RoundedRectangle(x, y, width, height, radius);
			shape = game.add.graphics(0, 0);		
			shape.beginFill(hex, 1);
			shape.drawShape(square);
			shape.endFill();
			
			chart[color] = game.add.group();
			chart[color].custom = {};
			var colorName = (color.indexOf("#") !== -1) ? color.substring(1) : color;
			// chart[color].id = "color_"+colorName;
			chart[color].custom.shape = shape;
			chart[color].add(shape);
			
			// Adding the text
			sb = shape.getBounds();
			text = game.add.text(sb.x, 0, i+1, {
				font: "RobotoRegular",
				fontSize: '40px',
				fill: 'black'
			});
			chart[color].add(text);
			
			tb = text.getBounds();
			deltaY = 4;
			text.x += (sb.width - tb.width)/2;
			text.y += ((sb.height - tb.height)/2) + deltaY;
			
			// Add highlight
			var depth = 3;
			square = new Phaser.RoundedRectangle(x-depth, y-depth, width+(2*depth), height+(2*depth), radius);
			hex = utils.colorToHex(settings.colorChart.bgColor);
			shape = game.add.graphics(0, 0);
			shape.beginFill(hex, 1);
			shape.drawShape(square);
			shape.endFill();
			chart[color].addAt(shape,0);
			square = new Phaser.RoundedRectangle(x-(2*depth), y-(2*depth), width+(4*depth), height+(4*depth), radius);
			hex = utils.colorToHex(color);
			shape = game.add.graphics(0, 0);
			shape.beginFill(hex, 1);
			shape.drawShape(square);
			shape.endFill();
			chart[color].addAt(shape,0);
			chart[color].custom.highlight = shape;
			chart[color].custom.highlight.visible = false;

			chart.add(chart[color]);
		}
		
		cb = chart.getBounds();
		chart.x = (settings.world.width - (cb.width + padding))/2;
		chart.y = settings.colorChart.y + (settings.colorChart.height - height)/2;
		
		self.chart = chart;
	}
	
	function turn(color, on) {
		var visible = on !== false; // default true
		self.chart[color].custom.highlight.visible = visible;
		return visible;
	}
	
	function setAlpha(greater) {
		var alpha = {
			on: 1,
			off: 0.5
		};
		var on = greater !== true;
		var color;
		for (var i = 0; i < settings.colors.length; i++) {
			color = settings.colors[i];
			if (!greater && self.chart[color].custom.highlight.visible) {
				on = !on;
			}
			self.chart[color].custom.shape.alpha = on ? alpha.on : alpha.off;
			if (greater && self.chart[color].custom.highlight.visible) {
				on = !on;
			}
		}
	}
	
	function startFlashing(color) {
		_flashingLoop = game.time.events.loop(Phaser.Timer.SECOND/2, function(){
			self.chart[color].custom.highlight.visible = !self.chart[color].custom.highlight.visible;
		});
		_flashingColor = color;
	}
	
	function stopFlashing() {
		if (!_flashingLoop) {
			return;
		}
		game.time.events.remove(_flashingLoop);
		_flashingLoop = null;
		self.chart[_flashingColor].custom.highlight.visible = true;
	}
	
	function setParams(params) {
		params = params || {};
		game = params.game || game;
	}
	
	module.exports = self = {
		chart: null,
		create: create,
		previousResultColor: null,
		setAlpha: setAlpha,
		setParams: setParams,
		startFlashing: startFlashing,
		stopFlashing: stopFlashing,
		shufflingColor: null,
		turn: turn
	};
});