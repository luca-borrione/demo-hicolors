require.config({
	waitSeconds : 30,
	baseUrl: "./modules",
	deps: ["app"],
	paths: {
		domReady: "../assets/libs/domReady/domReady",
		i18n: "../assets/libs/i18n/i18n",
		nls: "../custom/nls",
		Phaser: "../assets/libs/phaser-ce/build/phaser",
		text: "../assets/libs/text/text"
	},
	shim: {
		Phaser: {
			exports: "Phaser"
		}
	}
});