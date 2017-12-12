define(function(require, exports, module) {
	"use strict";
	
	var bigBall = require("./bigBall"),
		k = JSON.parse(require("text!constants.json")),
		messageObserver = require("util/messageObserver"),
		Phaser = require("Phaser"),
		settings = require("i18n!nls/settings"),
		utils = require("../util/utils");
	
	var game, self,
		_currentColor,
		_motionTween,
		_targetPoints = {},
		_slapsLeft;
	
	// When the big ball and the controls are positioned, we can define the positions between them to be used to swing the shuffler ball
	messageObserver.postRequest(["bigBall.position", "controls.plus.position", "controls.minus.position"], function(params){
		var bigBallX = params["bigBall.position"].x,
			bigBallY = params["bigBall.position"].y,
			plusX = params["controls.plus.position"].x,
			minusX = params["controls.minus.position"].x;
		
		_targetPoints[k.LEFT_TO_RIGHT] = {
			x: bigBallX + (plusX - bigBallX)/2,
			y: bigBallY
		};
		_targetPoints[k.RIGHT_TO_LEFT] = {
			x: minusX + (bigBallX - minusX)/2,
			y: bigBallY
		};
	});
		
	function getCurrentColor() {
		return _currentColor;
	}
	
	function getDiameter() {
		var gd = self.displayObject.graphicsData;
		return gd[0].shape._diameter;
	}
	
	function getSlapsLeft() {
		return _slapsLeft;
	}
	
	function setSlapsLeft(slapsLeft) {
		if (typeof slapsLeft === "number" && slapsLeft >= 0) {
			_slapsLeft = slapsLeft;
		}
	}
	
	function changeColorTo(color) {
		var displayObject = self.displayObject,
			hex = utils.colorToHex(color);
		
		_currentColor = color;
		
		displayObject.beginFill(hex);
		displayObject.drawCircle(0, 0, settings.shuffler.diameter);
		displayObject.endFill();
	}
	
	function create() {
		var displayObject,
			baseScale = bigBall.getBaseScale(),
			index = game.world.getChildIndex(bigBall.displayObject);
		
		_currentColor = game.rnd.pick(settings.colors);
		
		// Adding the big ball to the world
		displayObject = new Phaser.Graphics(game);
		// displayObject.name = "shuffler";
		displayObject.scale.setTo(baseScale, baseScale);
		// displayObject.visible = false;
		self.displayObject = displayObject;

		game.world.addChildAt(displayObject, index);
		
		_slapsLeft = game.rnd.between(settings.bigBall.minSlaps, settings.bigBall.maxSlaps);
		
		// Ensuring that the shuffler has a different color from the big ball
		self.changeColorTo(game.rnd.pick(settings.colors));
		while (_currentColor === bigBall.getCurrentColor()) {
			self.changeColorTo(game.rnd.pick(settings.colors));
		}
		
		wobble(displayObject);
	}
	
	function fire(direction) {
		game.physics.arcade.enable(self.displayObject);
		moveTo(_targetPoints[direction].x, _targetPoints[direction].y, settings.shuffler.triggerSpeed, "Quad.easeOut");
	}
	
	function moveTo(x, y, duration, ease) {
		ease = ease || "Linear";
		_motionTween = game.add.tween(self.displayObject)
			.to({x:x, y:y}, duration, ease, true, 0);
			
		_motionTween.onComplete.add(function(){
			// return;
			self.direction = -self.direction;
			self.collided = false;
			if (_slapsLeft === 0) {
				self.displayObject.destroy();
				self.displayObject = null;
				return;
			}
			var targetX = _targetPoints[self.direction].x,
				targetY = _targetPoints[self.direction].y;
			var ease = "Quad.easeInOut";
			var speed = settings.shuffler.speed;
			if (_slapsLeft === 1) {
				ease = "Quad.easeIn";
				targetX = bigBall.displayObject.worldPosition.x;
				targetY = bigBall.displayObject.worldPosition.y;
				speed = speed/2;
			}
			moveTo(targetX, targetY, speed, ease);
		});
	}
	
	function wobble(displayObject) {
		displayObject.custom = displayObject.custom || {};
		
		if (typeof displayObject.custom.wobbleAngle === "undefined") {
			displayObject.custom.wobbleAngle = settings.shuffler.wobbleAngle;
		}
		if (typeof displayObject.custom.wobbleScale === "undefined") {
			displayObject.custom.wobbleScale = settings.shuffler.wobbleScale;
		}
	
		var wobbleInterval = settings.shuffler.wobbleInterval,
			angle = displayObject.custom.wobbleAngle,
			// min = displayObject.custom.wobbleScale + game.rnd.normal()/10,
			min = displayObject.custom.wobbleScale,
			max = 2 - min,
			scaleX , scaleY;
		
		if (displayObject.scale.x > 1) {
			scaleX = min;
			scaleY = max;
		} else {
			scaleX = max;
			scaleY = min;
		}
		
		if (displayObject.angle === 0 || displayObject.angle > 0) {
			angle *= -1;
		}
		
		displayObject.custom.rotatingTween = game.add.tween(displayObject).to({angle: angle}, wobbleInterval, "Linear", true, 0);
		displayObject.custom.wobblingTween = game.add.tween(displayObject.scale).to({x: scaleX, y: scaleY}, wobbleInterval, "Bounce.easeOut", true, 0);
		displayObject.custom.wobblingTween.onComplete.add(wobble.bind(undefined, displayObject));
	}
	
	function setParams(params) {
		params = params || {};
		game = params.game || game;
	}
	
	module.exports = self = {
		changeColorTo: changeColorTo,
		collided: false,
		create: create,
		direction: 0,
		displayObject: null,
		fire: fire,
		getCurrentColor: getCurrentColor,
		getDiameter: getDiameter,
		getSlapsLeft: getSlapsLeft,
		moveTo: moveTo,
		setParams: setParams,
		setSlapsLeft: setSlapsLeft
	};
});