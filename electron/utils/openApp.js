const { BrowserWindow, app } = require("electron");
const getIp = require("./getIp");

const appWindows = {};

module.exports = function openApp({ scheme, url, window = {} }) {
	const {
		backgroundColor = "#fff",
		width = 800,
		height = 600,
		titleBarStyle = "default",
		darkTheme,
	} = window || {};

	console.log("App details: ", url, width, height);
	const icon = appDir("icon.icns");

	if (!appWindows[scheme]) {
		const win = new BrowserWindow({
			icon,
			width,
			height,
			backgroundColor,
			titleBarStyle,
			darkTheme,
			// modal: true,
			// parent: global.crotchetApp.window,
		});

		win.on("close", () => {
			delete appWindows[scheme];

			if (!Object.keys(appWindows).length) app.dock.hide();
		});

		appWindows[scheme] = win;
	}

	appWindows[scheme].loadURL(`http://${getIp()}:3127${url}`);

	app.dock.show();
};
