const { ipcMain, shell, clipboard, nativeImage } = require("electron");

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

const { Server } = require("socket.io");
const runScript = require("../utils/runScript");
const openApp = require("../utils/openApp");
const showToast = require("../utils/show-toast");

module.exports = function socketServer(server) {
	const pressKeys = async (...keys) => {
		await keyboard.pressKey(...keys);
		await keyboard.releaseKey(...keys);
	};

	const paste = async () => await pressKeys(Key.LeftSuper, Key.V);

	const copy = (text) => clipboard.writeText(text);

	const io = new Server(server, {
		cors: {
			origin: "*",
		},
	});

	const events = {
		"add-menu-items": (items) =>
			crotchetApp.addMenuItems(items, { replace: true }),

		"show-toast": showToast,

		copy,

		paste,

		"copy-paste": (text) => {
			copy(text);
			paste();
		},

		"copy-image": (image) => {
			try {
				clipboard.writeImage(nativeImage.createFromDataURL(image));
			} catch (error) {
				console.error("Copy image error: ", error);
			}
		},

		click() {
			mouse.click(Button.LEFT);
		},

		doubleClick() {
			mouse.doubleClick(Button.LEFT);
		},

		mousemove({ x, y }) {
			console.log("move: ", x, y);
			if (y != 0) {
				mouse.move(y > 0 ? down(10) : up(10));
			}

			if (x != 0) {
				mouse.move(x > 0 ? right(10) : left(10));
			}
		},

		run({ command, args, callback }) {
			runScript(command, args, callback);
		},

		app(props) {
			openApp(props);
		},

		open(url) {
			shell.openExternal(url);
		},

		emit({ event, payload } = {}) {
			crotchetApp.toggleWindow(true);
			crotchetApp.windowEmit("socket", { event, payload });
		},

		async type({ text, replace } = { replace: false }) {
			if (replace) {
				await pressKeys(Key.LeftSuper, Key.A);
				if (!text?.length) return pressKeys(Key.Backspace);
			}

			copy(text);
			await pressKeys(Key.LeftSuper, Key.V);
		},

		async keypress({ key, cmd, shift, option, alt, ctrl }) {
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

			pressKeys(...keys, key);
		},
	};

	io.on("connection", (socket) => {
		console.log("A new user connected to socket!");

		Object.keys(events).forEach((key) => socket.on(key, events[key]));
	});

	ipcMain.on("socket-emit", (_, { event, payload }) => {
		events[event](payload);
	});

	ipcMain.on("toggle-app-window", (_, show = false) =>
		crotchetApp.toggleWindow(show)
	);

	ipcMain.on("restore-size", () => {
		crotchetApp.resize();
	});

	ipcMain.on("open-url", (event, url) => {
		shell.openExternal(url);
	});
};
