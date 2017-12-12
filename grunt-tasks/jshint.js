module.exports = function(grunt) {
	"use strict";

 	grunt.config.merge({"jshint": {
		"default": {
			options: {
				// reporter: "<%= jshint_reporter %>"
				es3: true,				// Checks for Missing radix parameter in parseInt
				nonew: true,
				curly: true,
				// singleGroups: true,
				forin: true,
				// bitwise: true,
				eqeqeq: true,			// Prohibits == and != in favour of === and !==
				// freeze: true,
				strict: true			// Require `use strict` pragma in every file.
				// maxstatements:10
				// maxcomplexity: 3
				// latedef: true
			},
			files: [{
				expand: true,
				src: "<%= config.jsHintFiles %>",
				rename: function(destBase, destPath) {
					grunt.log.writeln("jshint: "+destPath);
					return destPath;
				}
			}]
		}
 	}});


	// With the following trap we ensure to load the npm task only when actually needed
	// In that way grunt won't waste time loading useless npm tasks and will run faster
	grunt.registerTask("jshint", function(){
		if (grunt.config.get("config.jsHintFiles")) {
			var args = Array.prototype.slice.call(arguments),
				task = {
					name: "jshint"
				};

			grunt.task.customLoadNpmTasks("grunt-contrib-jshint");
			grunt.task.customRun.apply(task, args);
		} else {
			grunt.log.writeln("no jshint files defined in the grunt-config"["cyan"]);
		}
	});
};