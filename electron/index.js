const path = require("path");
const { menubar } = require("menubar");
const { ipcMain, shell } = require("electron");
const {
	keyboard,
	mouse,
	left,
	right,
	up,
	down,
	Button,
} = require("@nut-tree/nut-js");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const getIp = require("./getIp");
const expressApp = express();
const server = http.createServer(expressApp);

expressApp.get("/", async (_, res) => {
	return res.send(getIp());
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

	socket.on("keypress", ({ key, shift }) => {
		console.log("Key press: ", key, shift);
		if (shift) keyboard.pressKey(86);
		keyboard.pressKey(key);
		keyboard.releaseKey(key);
		if (shift) keyboard.releaseKey(86);
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

mb.on("ready", () => {
	console.log("app is ready");
});

ipcMain.on("open-url", (event, url) => {
	shell.openExternal(url);
});
