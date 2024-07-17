const { ipcRenderer } = require("electron");
const getIp = require("./utils/getIp");

window.addEventListener("open-url", (e) => {
	ipcRenderer.send("open-url", e.detail);
});

window.addEventListener("socket-emit", (e) => {
	const { event, payload } = e.detail;
	ipcRenderer.send("socket-emit", { event, payload });
});

window.addEventListener("read-file", (e) =>
	ipcRenderer
		.invoke("read-file", e.detail)
		.then((result) =>
			window.dispatchEvent(
				new CustomEvent(`read-file:${e.detail}`, { detail: result })
			)
		)
);

window.addEventListener("write-file", (e) =>
	ipcRenderer.invoke("write-file", e.detail)
);

window.addEventListener("restore", () => ipcRenderer.send("restore"));

window.addEventListener("toggle-app", (e) => {
	ipcRenderer.send("toggle-app-window", e.detail);
});

window.addEventListener("toggle-background-window", (e) => {
	ipcRenderer.send("toggle-background-window", e.detail);
});

window.addEventListener("DOMContentLoaded", () => {
	document.body.classList.add("on-electron");
	document.body.setAttribute("data-socket-url", `http://${getIp()}:3127`);
});

ipcRenderer.on("background-window", function () {
	window.addEventListener("load", () => {
		document.body.classList.add("is-background-window");
	});
});

ipcRenderer.on("menu-item-click", function (_, itemId) {
	window.dispatchEvent(new CustomEvent(`menu-item-click:${itemId}`));
});

ipcRenderer.on("socket", function (_, props) {
	window.dispatchEvent(new CustomEvent("socket", { detail: props }));
});
