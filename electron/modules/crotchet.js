const { Tray, Menu, app, globalShortcut } = require("electron");
const { mouse, Button } = require("@nut-tree/nut-js");

module.exports = function Crotchet() {
	this.defaultSize = { width: 750, height: 480 };
	this.tray = null;
	this.showWindow = isDev;
	this.showBackgroundWindow = false;

	this.windows = {};

	this.menuItems = {};

	this.fullScreenTimeout = { then: (resolve) => setTimeout(resolve, 40) };

	this.backgroundAction = (action, props = {}) => {
		this.toggleBackgroundWindow(true);

		this.socketEmit(
			"background-action",
			{
				action,
				...props,
			},
			true
		);

		return;
	};

	this.openAppUrl = (url) => {
		this.toggleWindow(true);

		this.socketEmit("open-url", url);

		return;
	};

	this.openPage = (page, props) => {
		this.toggleWindow(true);

		this.socketEmit("open-page", { page, ...(props || {}) });

		return;
	};

	this.openApp = async ({ scheme, url, window = {} }) => {
		const { width, height, maximize, fullScreen } = window || {};

		this.toggleWindow(true);
		this.toggleDock(true);

		if (maximize || fullScreen) {
			if (fullScreen) {
				this.mainWindow.setFullScreen(true);
				await this.fullScreenTimeout;
			}

			this.mainWindow.maximize();
		} else this.resize(width && height ? { width, height } : undefined);

		this.mainWindow.webContents.executeJavaScript(
			/*js*/ `
				window.__crotchet.desktop.openApp({
					scheme: "${scheme}",
					url: "${url}",
				});
			`,
			true
		);

		this.mainWindow.focus();

		return;
	};

	this.setMainWindow = (window) => {
		this.mainWindow = window;
		this.registerShortcuts();
	};

	this.setBackgroundWindow = (window) => {
		this.backgroundWindow = window;

		this.backgroundWindow.hide();

		globalShortcut.register("Shift+Alt+T", () => {
			this.backgroundAction("confetti", {
				effect: "Left Flowers Then Right Flowers",
			});
		});

		this.windowEmit("background-window", null, true);
	};

	this.registerShortcuts = () => {
		globalShortcut.register("Alt+/", () => {
			this.toggleWindow();
		});

		globalShortcut.register("Shift+Alt+H", () => {
			this.openPage("search", {
				source: "heroIcons",
			});
		});

		globalShortcut.register("Shift+Alt+C", () => {
			this.openAppUrl("crotchet://action/clipboard");
		});

		globalShortcut.register("Shift+Alt+S", () => {
			this.openAppUrl(
				"crotchet://action/runAutomation?actions=crotchet%25253A%25252F%25252Fautomation-action%25252FreadClipboard%253C%21%253Ecrotchet%25253A%25252F%25252Fautomation-action%25252FpreviewSpotifySong"
			);
		});
	};

	this.socketEmit = (event, payload, background) => {
		this.windowEmit("socket", { event, payload }, background);
	};

	this.windowEmit = (event, payload, background) => {
		if (background) {
			this.backgroundWindow.webContents.send(event, payload);
			return;
		}

		this.mainWindow.webContents.send(event, payload, background);
	};

	this.restore = async () => {
		if (this.mainWindow.isFullScreen) {
			this.mainWindow.setFullScreen(false);
			await this.fullScreenTimeout;
		}

		if (this.mainWindow.isMaximized) this.mainWindow.restore();

		this.resize();
		this.toggleWindow(true);
		this.toggleDock(false);
	};

	this.resize = (size) => {
		const { width, height } = size ?? this.defaultSize;
		this.mainWindow.setSize(width, height);
		this.mainWindow.center();
	};

	this.toggleDock = (show) => {
		const visible = app.dock.isVisible();

		if (show == undefined) show = !visible;
		else if (show == visible) return;

		if (show) app.dock.show();
		else {
			app.dock.hide();
			this.mainWindow.show();
		}
	};

	this.toggleBackgroundWindow = (show) => {
		if (show == undefined) show = !this.showBackgroundWindow;

		if (show) this.backgroundWindow.show();
		else this.backgroundWindow.hide();

		this.showBackgroundWindow = show;

		if (!this.mainWindow.isFullScreen) {
			mouse.click(Button.LEFT);
		}

		return show;
	};

	this.toggleWindow = (show) => {
		if (show == undefined) show = !this.showWindow;

		if (show) {
			this.mainWindow.show();
		} else {
			this.mainWindow.hide();
			mouse.click(Button.LEFT);

			if (!Object.keys(this.windows).length) app.dock.hide();
		}

		this.showWindow = show;

		return show;
	};

	this.setMenuItems = (items = [], { replace = false } = {}) => {
		const defaultItems = [
			{ label: "About", role: "about" },
			{ label: "Quit", role: "quit" },
		];

		if (items) {
			if (replace) this.menuItems = {};
			items.forEach((item) => (this.menuItems[item.label] = item));
		}

		if (this.tray) this.tray.destroy();

		this.tray = new Tray(appDir("IconTemplate.png"));

		this.tray.setContextMenu(
			Menu.buildFromTemplate([
				{
					label: "Show app",
					type: "checkbox",
					checked: this.showWindow,
					click: (event) => this.toggleWindow(event.checked),
				},
				...Object.values(this.menuItems).map((item) => {
					return {
						...item,
					};
				}),
				{ type: "separator" },
				...defaultItems,
			])
		);
	};

	this.addMenuItems = (items, { replace = false } = {}) => {
		this.setMenuItems(
			Object.entries(items).map(([key, item]) => ({
				...item,
				click: async () => {
					this.windowEmit("menu-item-click", key, true);
				},
			})),
			{ replace }
		);
	};
};
