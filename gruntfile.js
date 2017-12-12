module.exports = function(grunt) {
	"use strict";

	// Adding the folder node_modules under the process folder to the require paths
	var path = process.cwd()+"/node_modules";
	if (module.paths.indexOf(path) === -1) {
		module.paths.push(path);
	}

	require("time-grunt")(grunt);	// Display the elapsed execution time of grunt tasks



	// Project configuration.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var config = {};
	if (grunt.file.exists("grunt-config.json")) {
		config = grunt.file.readJSON("grunt-config.json");
	}
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		config: config
	});

	// Custom Subroutines
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	/**
	 * Adding the possibility to suppress the log headers
	 * via grunt config
	 */
	grunt.log.header = (function(log) {
		return function (message) {
			var printHeader = grunt.config.get("log.printHeader");
			if (printHeader !== false) {
				log(message);
			} else {
				// console.log("suppressing header: " + message);
			}
		};
	})(grunt.log.header);

	/**
	 *
	 * @param taskName
	 * @param moduleName
	 * @returns {*}
	 */
	grunt.task.customLoadNpmTasks = function(taskName, moduleName) {
		moduleName = moduleName || taskName;
		if (! grunt.file.exists("node_modules/"+moduleName)) {
			return grunt.fail.fatal("The npm module " + taskName + " is not installed");
		}
		grunt.task.loadNpmTasks(taskName);
	};

	/**
	 *
	 */
	grunt.task.customRun = function() {
		var args = Array.prototype.slice.call(arguments),
			taskName = this.name,
			defaultTarget = this.defaultTarget,
			targetMandatory = this.targetMandatory,
			target = args[0],
			originalPrintHeader = grunt.config.get("log.printHeader");

		if (! taskName) {
			return grunt.fail.fatal("Missing taskName");
		}

		/**
		 *
		 * @private
		 */
		function _resetLogHeader() {
			grunt.config.set("log.printHeader", originalPrintHeader);
		}

		if (target) {
			grunt.task.customLoadNpmTasks("grunt-then");
			args = args.join(":");
			// Suppressing the double header resulting in the task calling itself again
			grunt.config.set("log.printHeader", false);
			grunt.task.run(taskName+":"+args).then(_resetLogHeader);
		} else {
			if (defaultTarget) {
				grunt.task.run(taskName + ":"+defaultTarget);
			} else if (targetMandatory === true) {
				grunt.fail.fatal("A target is mandatory for this task");
			} else {
				grunt.task.customLoadNpmTasks("grunt-then");
				// Suppressing the double header resulting in the task calling itself again
				grunt.config.set("log.printHeader", false);
				grunt.task.run(taskName).then(_resetLogHeader);
			}
		}
	};

	grunt.loadTasks("grunt-tasks"); // Loading the project specific grunt tasks
};
