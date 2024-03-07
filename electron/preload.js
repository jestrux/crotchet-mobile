const { ipcRenderer } = require("electron");
const getIp = require("./getIp");

window.addEventListener("open-url", (e) => {
	ipcRenderer.send("open-url", e.detail);
});

window.addEventListener("DOMContentLoaded", () => {
	document.body.classList.add("on-electron");
	document.body.setAttribute("data-socket-url", `http://${getIp()}:3127`);
});
