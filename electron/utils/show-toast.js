const { Notification } = require("electron");

module.exports = function showToast(message, icon) {
	const n = new Notification({ body: message, icon });
	n.show();
};
