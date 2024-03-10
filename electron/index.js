const path = require("path");
// const isDev = require("electron-is-dev");
// const { menubar } = require("menubar");
const Crotchet = require("./modules/crotchet");
const { app, BrowserWindow } = require("electron");

const isDev = process.env.NODE_ENV == "dev";
let mainWindow = null;
const crotchetApp = new Crotchet();

console.log("Env: ", process.env.NODE_ENV);

global.appDir = (...subPaths) => path.join(__dirname, ...subPaths);
global.buildDir = (...subPaths) => appDir("build", ...subPaths);
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
		backgroundColor: "#FFF",
		width: 360,
		height: 540,
		show: false,
		frame: false,
		fullscreenable: false,
		resizable: false,
		webPreferences: {
			devTools: isDev,
			nodeIntegration: true,
			preload: appDir("preload.js"),
		},
	});

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
			// openAsHidden: true,
		});
	}

	crotchetApp.setMainWindow(mainWindow);
};

app.whenReady().then(() => {
	crotchetApp.setMenuItems();
	createMainWindow();
});

app.dock.hide();

// global.crotchetApp = menubar({
// 	icon: appDir("icon.png"),
// 	dir: buildDir(),
// 	browserWindow: {
// 		width: 360,
// 		height: 540,
// 		backgroundColor: "#000000",
// 		webPreferences: {
// 			nodeIntegration: true,
// 			preload: appDir("preload.js"),
// 		},
// 	},
// 	preloadWindow: true,
// });

// global.crotchetApp.on("ready", () => {
// 	console.log("app is ready");
// });
