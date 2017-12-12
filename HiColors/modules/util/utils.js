define(function(require, exports, module) {
	"use strict";
	
	/**
	 * Converts any string colour accepted by CSS into its hexadecimal value parsed as a decimal number.
	 * @param {string} colorString - A valid colour string containing a value accepted by CSS
	 * @returns {number} - The hexadecimal value expressed as a decimal number
	 * @default 0 - a black value is returned as a fallback default value
	 * @example
	 * colorToHex("teal")					// returns 008080
	 * colorToHex("#2E2E2E")				// returns 3026478
	 * colorToHex("rgb(255,255,0)")			// returns 16776960
	 * colorToHex("hsl(300, 100%, 50%)")	// returns 16711935
	 * @see {@link https://stackoverflow.com/a/24366628/1032370|stackoverflow}
	 * @see {@link https://stackoverflow.com/a/5624139/1032370|RGX to hex}
	 * @lastModified: 8 December 2017
	 */
	function colorToHex(colorString) {
		var hexString = "",
			colors,
			div;
		// append a new element with the desired colour to the dom
		div = document.createElement("div");
		div.style.color = colorString;
		div.style.visibility = "hidden";
		document.body.appendChild(div);
		// grab the rgb code from the dom element and remove it straight after
		colors = window.getComputedStyle(div).color.match(/\d+/g).map(function(a){ return parseInt(a,10); });
		document.body.removeChild(div);
		// convert the rgb code into an hexadecimal string
		if (colors.length >= 3) {
			hexString = (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1));
		}
		return parseInt(hexString,16); // parse the hexadecimal string and output a decimal number
	}

	module.exports = {
		colorToHex: colorToHex
	};
});