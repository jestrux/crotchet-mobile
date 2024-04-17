const { Tray, Menu, app, globalShortcut } = require("electron");

module.exports = function Crotchet() {
	this.tray = null;
	this.showWindow = isDev;

	this.windows = {};

	this.menuItems = {};

	this.setMainWindow = (window) => {
		this.mainWindow = window;

		globalShortcut.register("Alt+/", () => {
			this.toggleWindow();
		});
	};

	this.windowEmit = (event, payload) => {
		this.mainWindow.webContents.send(event, payload);
	};

	this.resize = (size) => {
		const { width, height } = size ?? { width: 750, height: 480 };
		this.mainWindow.setSize(width, height);
		this.mainWindow.center();
	};

	this.toggleWindow = (show) => {
		if (show == undefined) show = !this.showWindow;
		else if (show == this.showWindow) return;

		if (show) {
			this.mainWindow.show();
			app.dock.show();
		} else {
			this.mainWindow.hide();

			if (!Object.keys(this.windows).length) app.dock.hide();
		}

		this.showWindow = show;

		return show;
	};

	this.hide = () => {
		Object.values(this.windows).forEach((w) => w.close());
		this.mainWindow.hide();
		this.showWindow = false;
		this.setMenuItems();
		app.dock.hide();
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
					// accelerator: "Alt+/",
					click: (event) => {
						console.log("Click: ", event);

						if (!event.checked) {
							this.mainWindow.hide();

							if (!Object.keys(this.windows).length)
								app.dock.hide();
						} else {
							this.mainWindow.show();
							app.dock.show();
						}

						this.showWindow = event.checked;
					},
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
					this.windowEmit("menu-item-click", key);
				},
			})),
			{ replace }
		);
	};
};
