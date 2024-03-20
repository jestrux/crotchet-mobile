const { BrowserWindow, app } = require("electron");

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

	if (!crotchetApp.windows[scheme]) {
		const win = new BrowserWindow({
			icon,
			width,
			height,
			backgroundColor,
			titleBarStyle,
			darkTheme,
			frame: true,
			fullscreenable: false,
			resizable: isDev,
			minimizable: false,
			webPreferences: {
				devTools: isDev,
			},
		});

		win.on("close", () => {
			delete crotchetApp.windows[scheme];

			if (
				!crotchetApp.showWindow &&
				!Object.keys(crotchetApp.windows).length
			)
				app.dock.hide();
		});

		win.webContents.openDevTools({ mode: "right" });
		crotchetApp.windows[scheme] = win;
	}

	// Temporarily load a blank page to clear any saved data
	crotchetApp.windows[scheme].loadURL(
		"data:text/plain;base64,SGVsbG8sIHdvcmxk"
	);

	try {
		crotchetApp.windows[scheme].webContents.executeJavaScript(
			/*js*/ `
				document.body.classList.add("on-electron");

				window.addEventListener("socket-emit", (e) => {
					const { event, payload } = e.detail;
					window.__crotchet.socketEmit(event, payload);
				});

				if(!window.__crotchet) window.__crotchet = {};

				const { searchParams } = new URL("crotchet://app${url}");

				window.__crotchet.app = {
					scheme: "${scheme}",
					props: Object.fromEntries(searchParams.entries()),
				}
			`,
			true
		);
	} catch (error) {
		console.log("Failed to set app: ", error);
	}

	crotchetApp.windows[scheme].loadURL(
		isDev ? "http://localhost:5173/" : `file://${buildDir("index.html")}`
	);

	// crotchetApp.windows[scheme].loadURL(`http://${getIp()}:3127${url}`);

	if (!app.dock.isVisible()) app.dock.show();
};
