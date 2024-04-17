const { ipcRenderer } = require("electron");
const getIp = require("./utils/getIp");

window.addEventListener("open-url", (e) => {
	ipcRenderer.send("open-url", e.detail);
});

window.addEventListener("socket-emit", (e) => {
	const { event, payload } = e.detail;
	ipcRenderer.send("socket-emit", { event, payload });
});

window.addEventListener("restore-size", () => ipcRenderer.send("restore-size"));

window.addEventListener("toggle-app", (e) => {
	ipcRenderer.send("toggle-app-window", e.detail);
});

window.addEventListener("DOMContentLoaded", () => {
	document.body.classList.add("on-electron");
	document.body.setAttribute("data-socket-url", `http://${getIp()}:3127`);
});

ipcRenderer.on("menu-item-click", function (_, itemId) {
	window.dispatchEvent(new CustomEvent(`menu-item-click:${itemId}`));
});
