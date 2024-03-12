const { Tray, Menu, app } = require("electron");

module.exports = function Crotchet() {
	this.tray = null;
	this.showWindow = isDev;

	this.windows = {};

	this.menuItems = {};

	this.setMainWindow = (window) => {
		this.mainWindow = window;
	};

	this.windowEmit = (event, payload) => {
		this.mainWindow.webContents.send(event, payload);
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
					click: (event) => {
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
