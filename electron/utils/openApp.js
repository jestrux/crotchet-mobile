module.exports = async function openApp({ scheme, url, window = {} }) {
	const { width, height } = window || {};

	crotchetApp.toggleWindow(true);

	crotchetApp.resize(width && height ? { width, height } : undefined);

	crotchetApp.mainWindow.webContents.executeJavaScript(
		/*js*/ `
			window.__crotchet.desktop.openApp({
				scheme: "${scheme}",
				url: "${url}",
			});
		`,
		true
	);

	return;
};
