module.exports = function(grunt) {
	"use strict";

 	grunt.config.merge({"connect": {
		server: {
			options: {
				port: 9090,
				useAvailablePort: true,
				protocol: "http",
				hostname: "*",
				base: "./",
				keepalive: true
			}
		},
		hicolors: {
			options: {
				port: 9091,
				useAvailablePort: true,
				protocol: "http",
				hostname: "*",
				base: "./HiColors",
				keepalive: true,
				open: true
			}
		}
 	}});


	// With the following trap we ensure to load the npm task only when actually needed
	// In that way grunt won't waste time loading useless npm tasks and will run faster
	grunt.registerTask("connect", function(){
		var args = Array.prototype.slice.call(arguments),
			task = {
				name: "connect",
				defaultTarget: "server"
			};

		grunt.task.customLoadNpmTasks("grunt-contrib-connect");
		grunt.task.customRun.apply(task, args);
	});
};
