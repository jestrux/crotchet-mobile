const path = require("path");
// const isDev = require("electron-is-dev");
// const { menubar } = require("menubar");
const Crotchet = require("./modules/crotchet");
const { app, BrowserWindow } = require("electron");

global.isDev = process.env.NODE_ENV == "dev";
let mainWindow = null,
	backgroundWindow = null;
const crotchetApp = new Crotchet();

console.log("Env: ", process.env.NODE_ENV);

global.appDir = (...subPaths) => path.join(__dirname, ...subPaths);
global.buildDir = (...subPaths) => appDir("app", ...subPaths);
global.crotchetApp = crotchetApp;

const expressServer = require("./modules/express-server");
const socketServer = require("./modules/socket-server");
const server = expressServer();

socketServer(server);

server.listen(3127, () => {
	console.log("Listen on the port 3127...");
});

const createMainWindow = () => {
	mainWindow = new BrowserWindow({
		// backgroundColor: "#FFF",
		// titleBarStyle: "hidden",
		width: 750,
		height: 480,
		show: isDev,
		frame: false,
		transparent: true,
		resizable: isDev,
		minimizable: false,
		webPreferences: {
			devTools: true,
			nodeIntegration: true,
			preload: appDir("preload.js"),
		},
	});

	mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
	// mainWindow.setHiddenInMissionControl(true);
	mainWindow.webContents.executeJavaScript(
		/*js*/ `
			localStorage.__onDesktop = true;
		`,
		true
	);

	if (isDev) {
		// mainWindow.webContents.openDevTools({ mode: "detach" });

		mainWindow.loadURL("http://localhost:5173/");

		try {
			require("electron-reloader")(module);
		} catch {
			//
		}
	} else {
		mainWindow.loadFile(buildDir("index.html"));
		app.setLoginItemSettings({
			openAtLogin: true,
			openAsHidden: false,
		});
	}

	crotchetApp.setMainWindow(mainWindow);
};

const createBackgroundWindow = () => {
	backgroundWindow = new BrowserWindow({
		alwaysOnTop: true,
		show: false,
		frame: false,
		transparent: true,
		webPreferences: {
			devTools: true,
			nodeIntegration: true,
			preload: appDir("preload.js"),
		},
	});

	backgroundWindow.setVisibleOnAllWorkspaces(true, {
		visibleOnFullScreen: true,
	});
	backgroundWindow.maximize();
	backgroundWindow.setIgnoreMouseEvents(true);
	backgroundWindow.webContents.executeJavaScript(
		/*js*/ `
			localStorage.__onDesktop = true;
		`,
		true
	);

	if (isDev) {
		backgroundWindow.loadURL("http://localhost:5173/");
		backgroundWindow.setHiddenInMissionControl(true);
		// backgroundWindow.webContents.openDevTools({ mode: "detach" });

		try {
			require("electron-reloader")(module);
		} catch {
			//
		}
	} else {
		backgroundWindow.loadFile(buildDir("index.html"));
	}

	crotchetApp.setBackgroundWindow(backgroundWindow);
};

app.whenReady().then(() => {
	crotchetApp.setMenuItems();
	createMainWindow();

	setTimeout(() => {
		createBackgroundWindow();
	}, 2000);
});

app.on("window-all-closed", () => {});

app.dock.hide();
