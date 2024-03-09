const { Tray, Menu } = require("electron");

module.exports = function Crotchet() {
	this.tray = null;

	this.menuItems = {};

	this.setMainWindow = (window) => {
		this.mainWindow = window;
	};

	this.windowEmit = (event, payload) => {
		this.mainWindow.webContents.send(event, payload);
	};

	this.setMenuItems = (newItems = []) => {
		const defaultItems = [
			{ label: "About", role: "about" },
			{ label: "Quit", role: "quit" },
		];

		if (newItems) {
			newItems.forEach((item) => (this.menuItems[item.label] = item));
		}

		if (this.tray) this.tray.destroy();

		this.tray = new Tray(appDir("icon.png"));

		this.tray.setContextMenu(
			Menu.buildFromTemplate([
				{
					label: "Open app",
					click() {
						console.log("Open app");
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

	this.addMenuItem = (item) => {
		item.click = async () => {
			this.windowEmit("menu-item-click", item._id);
		};

		this.setMenuItems([item]);
	};
};
