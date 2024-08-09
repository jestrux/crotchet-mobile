const os = require("os");
const fs = require("fs");
const path = require("path");

function getIp() {
	const nets = os.networkInterfaces();
	const results = Object.create(null);
	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			// 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
			const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
			if (net.family === familyV4Value && !net.internal) {
				if (!results[name]) {
					results[name] = [];
				}
				results[name].push(net.address);
			}
		}
	}

	return results.en0[0];
}

const capacitorConfig = {
	appId: "tz.co.crotchety",
	appName: "Crotchety",
	webDir: "docs",
	server: {
		androidScheme: "https",
	},
	electron: {
		customUrlScheme: "crotchety",
		trayIconAndMenuEnabled: true,
		splashScreenEnabled: false,
		splashScreenImageName: "splash.png",
		hideMainWindowOnLaunch: false,
		deepLinkingEnabled: true,
		deepLinkingCustomProtocol: "crotchety",
	},
};

if (process.env.NODE_ENV == "dev") {
	capacitorConfig.server.url = `http://${getIp()}:5178`;
	capacitorConfig.server.cleartext = true;
}

const configPath = path.resolve(__dirname, "capacitor.config.json");

// const config = fs.readFileSync(configPath, JSON.stringify(capacitorConfig));
fs.writeFileSync(configPath, JSON.stringify(capacitorConfig, null, 4));
