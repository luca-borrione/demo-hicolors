define(function(require) {
	"use strict";
	
	var bigBall = require("./displayObjects/bigBall"),
		colorChart = require("./displayObjects/colorChart"),
		controls = require("./ui/controls"),
		Phaser = require("Phaser"),
		plaques = require("./ui/plaques/main"),
		settings = require("i18n!nls/settings"),
		shuffler = require("./displayObjects/shuffler"),
		sound = require("./sound"),
		utils = require("./util/utils");
	
	var sfx = sound.sfx;

	var game = new Phaser.Game(960, 600, Phaser.AUTO, '');
	window.game = game; // debugging purposes
	
	/**
	 * game state: ticketReady
	 */
	game.state.add("ticketReady", {
		preload: function() {
			sound.preload();
		},
		
		create: function (game) {
			game.physics.startSystem(Phaser.Physics.ARCADE);
			game.stage.backgroundColor = "black";
			
			bigBall.create();
			
			game.physics.arcade.enable(bigBall.displayObject);
			
			sound.create();
			sound.stopAll();
			sfx.bgMusic.play();
			
			colorChart.create();
			colorChart.turn(bigBall.getCurrentColor(),true);
			
			controls.create();
			plaques.create();
			
			setPrize();
		},
		
		update: function () {
			if (shuffler.displayObject) {
				game.physics.arcade.collide(shuffler.displayObject, bigBall.displayObject, shuffle, null, this);
			}
		}
	});
	

	
	function setPrize() {
		var color = bigBall.getCurrentColor(),
			colorIndex = settings.colors.indexOf(color),
			minusIndex = colorIndex - 1,
			plusIndex = settings.colors.length - colorIndex - 2;
		
		controls.minus.setPrize(minusIndex > -1 ? settings.paytable[minusIndex] : 0);
		controls.plus.setPrize(plusIndex > -1 ? settings.paytable[plusIndex] : 0);
		
		controls.minus.enable();
		controls.plus.enable();
		if (colorIndex === 0) {
			controls.minus.disable();
		} else if (colorIndex === settings.colors.length - 1) {
			controls.plus.disable();
		}
	}
	
	function shuffle() {
		if (shuffler.collided) {
			return;
		}
		shuffler.collided = true;

		var slapsLeft = shuffler.getSlapsLeft();
		slapsLeft--;
		shuffler.setSlapsLeft(slapsLeft);
		if (slapsLeft === 0) { // last one
			sfx.crunch.play();
			bigBall.increaseBaseScaleBy(0.1);
		} else {
			sfx.splat.play();
		}
		
		var	direction = shuffler.direction,
			shufflerColor = shuffler.getCurrentColor(),
			newColor = shufflerColor,
			hex = utils.colorToHex(shufflerColor),
			shufflerDiameter = shuffler.getDiameter(),
			bigBallDiameter = bigBall.getDiameter(),
			baseScale = bigBall.getBaseScale(),
			times, child;
		
		while (newColor === shufflerColor) {
			newColor = game.rnd.pick(settings.colors);
		}
		shuffler.changeColorTo(newColor);
		
		times = bigBallDiameter / shufflerDiameter;
		
		child = game.add.graphics();
		child.visible = false;
		child.beginFill(hex);
		child.drawCircle(0,0, shufflerDiameter);
		child.endFill();
		child.x = -direction * ((bigBall.displayObject.getBounds().width/2) - (shufflerDiameter/2));
		child.visible = true;
		bigBall.displayObject.addChild(child);
	
		game.add.tween(child.scale).to({x:times,y:times}, 200, "Linear", true, 0);
		game.add.tween(child)
			.to({x:0}, 200, "Linear", true, 0)
			.onComplete.add(function(){
				bigBall.changeColorTo(shufflerColor);
				bigBall.displayObject.removeChild(child);
				if (shuffler.getSlapsLeft() > 0) {
					bigBall.startEmitter(direction);
				}
				colorChart.turn(shufflerColor,true);
				if (colorChart.shufflingColor && colorChart.shufflingColor !== colorChart.previousResultColor) {
					colorChart.turn(colorChart.shufflingColor,false);
				}
				colorChart.shufflingColor = shufflerColor;
				// Wait to change the color before checking the result
				if (shuffler.getSlapsLeft() === 0) {
					checkResult();
				}
			});
		
		// Wobbling Animation
		if (bigBall.wobblingTween) {
			bigBall.wobblingTween.stop();
		}
	
		bigBall.wobblingTween = game.add.tween(bigBall.displayObject.scale)
			.to({x: 0.7 * baseScale, y: 1.3 * baseScale}, 150, "Quad.easeIn", false, 0)
			.to({x: 1.4 * baseScale, y: baseScale}, 100, "Linear", false, 0)
			.to({x: baseScale, y: baseScale}, 500, "Quad.easeOut", false, 0);

		bigBall.wobblingTween.onComplete.add(function(){
			bigBall.wobblingTween.stop();
			bigBall.wobblingTween = null;
		});
		
		bigBall.wobblingTween.start();
	}
	
	function checkResult() {
		var chart = colorChart.chart,
			color = bigBall.getCurrentColor();
		
		colorChart.startFlashing(color);
		if (chart[color].custom.shape.alpha !== 1) {
			sfx.failure.play();
			game.time.events.add(Phaser.Timer.SECOND * 1.5, function(){
				plaques.loseSummary.show(bigBall.displayObject.x, bigBall.displayObject.y);
				game.input.onDown.add(restartGame);
			});
		} else {
			sfx.success.play();
			bigBall.bankAmount += controls.getCurrentControl().getPrize();
			bigBall.bankAmount = parseFloat(bigBall.bankAmount.toFixed(2));
			bigBall.bankText.text = "$"+bigBall.bankAmount;
			bigBall.bankText.visible = true;
			
			setPrize();
		}
	}
	
	function restartGame() {
		game.state.start("ticketReady");
	}
	
	function propagateParams() {
		var params = {game: game};
		bigBall.setParams(params);
		colorChart.setParams(params);
		controls.setParams(params);
		plaques.setParams(params);
		shuffler.setParams(params);
		sound.setParams(params);
	}

	// Let's go!
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	require(["domReady!"], function () {
		var robotoRegular = new FontFaceObserver("RobotoRegular");
		var robotoBold = new FontFaceObserver("RobotoBold");
		
		Promise.all([robotoRegular.load(), robotoBold.load()]).then(function () {
			document.documentElement.className += " fonts-loaded";
			propagateParams();
			game.state.start("ticketReady");
		});
	});
});