const path = require("path");
const { menubar } = require("menubar");
const { ipcMain, shell, clipboard, BrowserWindow } = require("electron");
const {
	keyboard,
	mouse,
	left,
	right,
	up,
	down,
	Button,
	Key,
} = require("@nut-tree/nut-js");

const express = require("express");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const getIp = require("./getIp");
const runScript = require("./utils/runScript");
const expressApp = express();
const server = http.createServer(expressApp);

// view engine setup
expressApp.set("views", path.join(__dirname, "build"));
expressApp.set("view engine", "jade");
// expressApp.set("view options", { layout: false });
// expressApp.use(express.static(path.join(__dirname, "build")));

// Public files
expressApp.use(
	express.static(path.join(__dirname, "build"), {
		setHeaders: (res, path) => {
			const pathArray = path.split(".");
			const extension = pathArray.pop();

			if (extension === "js") res.set("Content-Type", "text/javascript");
			else if (extension === "css") res.set("Content-Type", "text/css");
		},
	})
);

// Express setup
expressApp.use(express.json());

expressApp.get("/", async (_, res) => {
	res.send(getIp());
});

expressApp.get("/:app", async (req, res) => {
	const appJSFile = (
		await fs.promises.readdir(path.join(__dirname, "build/assets"))
	).find((file) => file.endsWith(".js") && file.startsWith("index"));

	res.render("index", {
		appJSFile,
		title: req.query.title,
		__crotchet: JSON.stringify({
			app: {
				scheme: req.params.app,
				props: req.query,
			},
		}),
	});
});

const io = new Server(server, {
	cors: {
		// origin: "http://localhost:3000",
		origin: "*",
	},
});

io.on("connection", (socket) => {
	console.log("A new user connected to socket!");

	socket.on("click", () => {
		console.log("click: ");
		mouse.click(Button.LEFT);
	});

	socket.on("doubleClick", () => {
		console.log("double click: ");
		mouse.doubleClick(Button.LEFT);
	});

	socket.on("mousemove", ({ x, y }) => {
		console.log("move: ", x, y);
		if (y != 0) {
			mouse.move(y > 0 ? down(10) : up(10));
		}

		if (x != 0) {
			mouse.move(x > 0 ? right(10) : left(10));
		}
	});

	socket.on("run", ({ command, args, callback }) => {
		runScript(command, args, callback);
	});

	socket.on("app", (props) => {
		openApp(props);
	});

	socket.on("open", (url) => {
		shell.openExternal(url);
	});

	socket.on("type", async (text) => {
		const clear = text.toLowerCase() == "clear";
		const paste = text.toLowerCase() == "paste";
		const replace = text.toLowerCase() == "replace";
		const selectAll = text.toLowerCase() == "select all";

		const pasteKeys = [Key.LeftSuper, Key.V];
		const selectAllKeys = [Key.LeftSuper, Key.A];
		const clearKeys = [Key.Backspace];

		if (![clear, paste, selectAll, replace].includes(true))
			clipboard.writeText(text);

		if (selectAll || clear) {
			await keyboard.pressKey(...selectAllKeys);
			await keyboard.releaseKey(...selectAllKeys);

			if (!clear) return;
		}

		if (clear) {
			await keyboard.pressKey(...clearKeys);
			await keyboard.releaseKey(...clearKeys);
			return;
		}

		await keyboard.pressKey(...pasteKeys);
		await keyboard.releaseKey(...pasteKeys);
	});

	socket.on("keypress", async ({ key, cmd, shift, option, alt, ctrl }) => {
		const allModifiers = Object.entries({
			86: shift,
			103: ctrl,
			106: cmd,
			107: option || alt,
		});

		// 106: cmd, // LeftCmd
		// RightShift: 97,
		// RightAlt: 109,
		// RightCmd: 112,
		// RightControl: 114,

		var keys = allModifiers.reduce(
			(agg, [k, v]) => (!v ? agg : [...agg, parseInt(k)]),
			[]
		);

		await keyboard.pressKey(...keys, key);
		await keyboard.releaseKey(...keys, key);
	});
});

server.listen(3127, () => {
	console.log("Listen on the port 3127...");
});

const mb = menubar({
	icon: path.join(__dirname, "icon.png"),
	dir: path.join(__dirname, "build"),
	browserWindow: {
		width: 360,
		height: 540,
		backgroundColor: "#000000",
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, "preload.js"),
		},
	},
	preloadWindow: true,
});

const appWindows = {};

const openApp = ({ scheme, url, window = {} }) => {
	const {
		backgroundColor = "#fff",
		width = 800,
		height = 600,
		titleBarStyle = "default",
		darkTheme,
	} = window || {};

	console.log("App details: ", url, width, height);
	const icon = path.join(__dirname, "icon.icns");

	if (!appWindows[scheme]) {
		const win = new BrowserWindow({
			icon,
			width,
			height,
			backgroundColor,
			titleBarStyle,
			darkTheme,
		});

		win.on("close", () => {
			appWindows[scheme] = null;
		});

		appWindows[scheme] = win;
	}

	appWindows[scheme].loadURL(`http://${getIp()}:3127${url}`);
};

mb.on("ready", () => {
	console.log("app is ready");
});

ipcMain.on("open-url", (event, url) => {
	shell.openExternal(url);
});
