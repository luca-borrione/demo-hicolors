define(function(require, exports, module) {
	"use strict";
	
	var bigBall = require("../displayObjects/bigBall"),
		colorChart = require("../displayObjects/colorChart"),
		k = JSON.parse(require("text!constants.json")),
		messageObserver = require("util/messageObserver"),
		Phaser = require("Phaser"),
		settings = require("i18n!nls/settings"),
		shuffler = require("../displayObjects/shuffler"),
		utils = require("../util/utils");
	
	var _currentControl,
		game, self;
	
	function _addControl(params, group) {
		var id = params.id,
			text = params.text || "",
			x = params.x || 0,
			y = params.y || 0;

		var diameter = settings.control.diameter,
			hex = utils.colorToHex("#2E2E2E"),
			circle, circleSprite, control, deltaY, _prizeValue, sb, shape, tb, textObject;

		// Adding the rounded square to the color chart
		circle = new Phaser.Circle(0, 0, diameter);
		shape = game.add.graphics();
		shape.beginFill(hex, 1);
		shape.drawShape(circle);
		shape.endFill();

		control = game.add.group();
		control.custom = {};
		circleSprite = game.add.sprite(0, 0);
		circleSprite.inputEnabled = true;
		circleSprite.events.onInputOver.add(genericOverHandler);
		circleSprite.events.onInputOut.add(genericOutHandler);
		circleSprite.events.onInputDown.add(setControlClickHandler(control));
		circleSprite.addChild(shape);
		control.add(circleSprite);

		var prizeTextObject = game.add.text(-diameter / 2, -diameter, "", {
			font: "RobotoRegular",
			fontSize: '20px',
			fill: 'white'
		}, control);

		// Adding the text
		sb = shape.getBounds();
		textObject = game.add.text(sb.x, 0, text, {
			font: "RobotoBold",
			fontSize: '80px',
			fill: settings.control.fontColor
		});
		control.add(textObject);

		tb = textObject.getBounds();
		deltaY = 2;
		textObject.x += (sb.width - tb.width) / 2;
		textObject.y = ((sb.height - tb.height) / 2) + deltaY - diameter / 2;

		if (group) {
			group.add(control);
		}
		control.x = x;
		control.y = y;

		if (id) {
			control.id = id;
		}
		
		messageObserver.postMessage("controls."+id+".position", {x:x, y:y});

		function disable() {
			circleSprite.inputEnabled = circleSprite.visible = false;
			textObject.addColor(settings.control.bgColor, 0);
		}

		function enable() {
			circleSprite.inputEnabled = circleSprite.visible = true;
			textObject.addColor(settings.control.fontColor, 0);
		}

		function setPrize(prizeValue) {
			_prizeValue = prizeValue;
			prizeTextObject.text = "$" + prizeValue;
			prizeTextObject.visible = prizeValue > 0;
		}

		function getPrize() {
			return _prizeValue;
		}

		return {
			disable: disable,
			displayObject: control,
			enable: enable,
			getPrize: getPrize,
			setPrize: setPrize
		};
	}
	
	function genericOverHandler() {
		game.canvas.style.cursor = "pointer";
	}
	function genericOutHandler() {
		game.canvas.style.cursor = "default";
	}
	
	function setControlClickHandler(control) {
		return function () {
			var direction;

			colorChart.stopFlashing();
			colorChart.shufflingColor = null;
			if (colorChart.previousResultColor) {
				colorChart.turn(colorChart.previousResultColor, false);
			}
			colorChart.previousResultColor = bigBall.getCurrentColor();

			switch (control.id) {
				case "minus":
					direction = k.LEFT_TO_RIGHT; // from left to right
					colorChart.setAlpha(false);
					_currentControl = self.minus;
					break;

				case "plus":
					direction = k.RIGHT_TO_LEFT; // from right to left
					colorChart.setAlpha(true);
					_currentControl = self.plus;
					break;

				default:
					break;
			}
			self.minus.disable();
			self.plus.disable();
			game.canvas.style.cursor = "default";

			bigBall.bankText.visible = false;

			shuffler.create();
			shuffler.direction = direction;
			shuffler.displayObject.x = control.worldPosition.x;
			shuffler.displayObject.y = control.worldPosition.y;
			shuffler.fire(direction);
		};
	}
	
	function create() {
		var padding = settings.control.padding,
			controlY = (settings.world.height - (settings.world.height - settings.colorChart.y))/2;
	
		var group = game.add.group();
		group.id = "controls";
	
		self.minus = _addControl({
			id: "minus",
			text: "-",
			x: padding
		}, group);
		self.plus = _addControl({
			id: "plus",
			text: "+",
			x: game.world.width - padding
		}, group);
		
		group.y = controlY;
	}
	
	function getCurrentControl() {
		return _currentControl;
	}
	
	function setParams(params) {
		params = params || {};
		game = params.game || game;
	}
	
	module.exports = self = {
		create: create,
		getCurrentControl: getCurrentControl,
		minus: null,
		plus: null,
		setParams: setParams
	};
});