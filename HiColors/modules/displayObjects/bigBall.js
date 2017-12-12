define(function(require, exports, module) {
	"use strict";
	
	var k = JSON.parse(require("text!constants.json")),
		messageObserver = require("util/messageObserver"),
		Phaser = require("Phaser"),
		settings = require("i18n!nls/settings"),
		utils = require("../util/utils");
	
	var _baseScale,
		_currentColor,	// this is the current color, which is not a game result color while shuffling
		history = [],	// this contains the game result colors history
		game, self;
		
	function changeColorTo(color) {
		var displayObject = self.displayObject,
			hex = utils.colorToHex(color);
		
		_currentColor = color;
		
		displayObject.beginFill(hex);
		displayObject.drawCircle(0, 0, settings.bigBall.startingDiameter);
		displayObject.endFill();
	}
	
	function getHistory() {
		return history;
	}
	
	function getBaseScale() {
		return _baseScale;
	}
	
	function getCurrentColor() {
		return _currentColor;
	}
	
	function getDiameter() {
		var gd = self.displayObject.graphicsData;
		return gd[0].shape._diameter;
	}
	
	function increaseBaseScaleBy(amount, ease) {
		return setBaseScale(_baseScale+amount, ease);
	}
	
	function setBaseScale(baseScale, ease) {
		_baseScale = baseScale;
		ease = ease || "Elastic";
		game.add.tween(self.displayObject.scale).to({ x: _baseScale, y: _baseScale}, 500, ease, true);
	}
	
	function create() {
		var color = game.rnd.pick(settings.colors),
			hex = utils.colorToHex(color),
			controlY = (settings.world.height - (settings.world.height - settings.colorChart.y))/2,
			displayObject;
		
		_baseScale = 1;
		history.push(color);
		_currentColor = color;
		
		// Adding the big ball to the world 
		displayObject = game.add.graphics();
		displayObject.name = "bigBall";
		displayObject.beginFill(hex);
		displayObject.drawCircle(0, 0, settings.bigBall.startingDiameter);
		displayObject.endFill();
		displayObject.x = game.world.centerX;
		displayObject.y = controlY;
		displayObject.custom = self;
		self.displayObject = displayObject;
		
		self.bankAmount = 1;
		var bankText = game.add.text(displayObject.x, displayObject.y+3, "$"+self.bankAmount, {
			font: "RobotoRegular",
			fontSize: "20px",
			fill: "white",
			stroke: "black",
			strokeThickness: 3,
			align: "center",
			boundsAlignH: "center",
			boundsAlignV: "middle"
		});
		// displayObject.addChild(bankText);
		bankText.anchor.setTo(0.5, 0.5);
		self.bankText = bankText;
		
		messageObserver.postMessage("bigBall.position", {x:displayObject.x, y:displayObject.y});
	}
	
	function startEmitter(direction) {
		var	color = self.getCurrentColor(),
			baseScale = self.getBaseScale(),
			renderTexture = _getRenderTexture(color, baseScale),
			b = self.displayObject.getBounds(),
			bigBallIndex = game.world.getChildIndex(self.displayObject),
			posX = self.displayObject.worldPosition.x,
			posY = self.displayObject.worldPosition.y,
			x = posX + (direction * (b.width/2) * baseScale),
			y = posY,
			rndParticles = game.rnd.between(settings.bigBall.minParticles, settings.bigBall.maxParticles);
		
		var emitter = game.add.emitter(x, y);
		game.world.setChildIndex(emitter, bigBallIndex);
		
		emitter.x = x;
		emitter.y = y;
		
		emitter.maxParticles = rndParticles;
	
		emitter.makeParticles(renderTexture);
	
		if (direction === k.LEFT_TO_RIGHT) {
			emitter.minParticleSpeed.setTo(50 * baseScale, -50 * baseScale);
			emitter.maxParticleSpeed.setTo(100 * baseScale, 50 * baseScale);
		} else {
			emitter.minParticleSpeed.setTo(-50 * baseScale, 50 * baseScale);
			emitter.maxParticleSpeed.setTo(-100 * baseScale, -50 * baseScale);
		}
		emitter.minParticleAlpha = 0;
		emitter.minParticleScale = 0.1;
		emitter.maxParticleScale = 0.7;
		
		emitter.setAlpha(1, 0, 750, "Linear", false);
		// emitter.autoAlpha = true;
		
		emitter.gravity = -50 * baseScale;
		var numberOfParticles = 7;
		var killedParticles = 0;
		emitter.start(true, 750, null, numberOfParticles, true);
		emitter.children.forEach(function(particle){
			var scaleX = particle.scale.x * 0.8,
				scaleY = particle.scale.y * 1.2;
			particle.scale.setTo(scaleX, scaleY);
			particle.events.onKilled.add(function() {
				killedParticles++;
				if (killedParticles === numberOfParticles) {
					emitter.destroy();
				}
			});
		});
	}
	
	
	function _getRenderTexture(color, baseScale) {
		var colorName = (color.indexOf("#") !== -1) ? color.substring(1) : color,
			id = colorName+"_"+baseScale.toString().replace(".","_"),
			renderTexture;
		
		if (game.cache.checkRenderTextureKey(id)) {
			return game.cache.getRenderTexture(id).texture;
		}
		
		var diameter = settings.shuffler.diameter,
			shape = new Phaser.Graphics(game),
			x, y;
		
		x = y = (diameter)/2;
		
		shape.beginFill(utils.colorToHex(color));
		shape.drawCircle(x, y, diameter);
		shape.endFill();
		shape.scale.setTo(baseScale, baseScale);
		
		var cb = shape.getBounds();
		var width = cb.width * baseScale,
			height = cb.height * baseScale;
	
		renderTexture = new Phaser.RenderTexture(game, width, height);
		renderTexture.renderXY(shape, 0, 0, true);
		game.cache.addRenderTexture(id, renderTexture);
		
		return renderTexture;
	}
	
	function setParams(params) {
		params = params || {};
		game = params.game || game;
	}
	
	module.exports = self = {
		bankAmount: 1,
		bankText: null,
		changeColorTo: changeColorTo,
		create: create,
		displayObject: null,
		getBaseScale: getBaseScale,
		getCurrentColor: getCurrentColor,
		getDiameter: getDiameter,
		increaseBaseScaleBy: increaseBaseScaleBy,
		setBaseScale: setBaseScale,
		setParams: setParams,
		startEmitter: startEmitter,
		amplitude: 0,
		getHistory: getHistory,
		wobblingTween: null
	};
});