const { BrowserWindow, app } = require("electron");

const appWindows = {};

module.exports = async function openApp({ scheme, url, window = {} }) {
	const {
		backgroundColor = "#fff",
		width = 800,
		height = 600,
		titleBarStyle = "default",
		darkTheme,
	} = window || {};

	// console.log("App details: ", url, width, height);
	const icon = appDir("icon.icns");

	if (!appWindows[scheme]) {
		const win = new BrowserWindow({
			icon,
			width,
			height,
			backgroundColor,
			titleBarStyle,
			darkTheme,
			webPreferences: {
				devTools: isDev,
			},
		});

		win.on("close", () => {
			delete appWindows[scheme];

			if (!crotchetApp.showWindow && !Object.keys(appWindows).length)
				app.dock.hide();
		});

		appWindows[scheme] = win;
	}

	try {
		appWindows[scheme].webContents.executeJavaScript(
			/*js*/ `
				document.body.classList.add("on-electron");

				window.addEventListener("socket-emit", (e) => {
					const { event, payload } = e.detail;
					window.__crotchet.socketEmit(event, payload);
				});

				const { searchParams } = new URL("crotchet://app${url}");
				const props = Object.fromEntries(searchParams.entries());

				if(!window.__crotchet) window.__crotchet = {};

				window.__crotchet.app = {
					scheme: "${scheme}",
					props
				}
			`,
			true
		);
	} catch (error) {
		console.log("Failed to set app: ", error);
	}

	appWindows[scheme].webContents.openDevTools({ mode: "right" });
	appWindows[scheme].loadURL(
		isDev ? "http://localhost:5173/" : `file://${buildDir("index.html")}`
	);
	// appWindows[scheme].loadURL(`http://${getIp()}:3127${url}`);

	if (!crotchetApp.showWindow) app.dock.show();
};
