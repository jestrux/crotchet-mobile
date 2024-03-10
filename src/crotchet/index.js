import { camelCaseToSentenceCase, randomId } from "@/utils";

export * from "@/utils";

export const registerAction = (scheme, name, action) => {
	let _label = name,
		_handler = action,
		tags = [];

	if (typeof action != "function") {
		_label = action.label;
		_handler = action.handler;
		tags = action.tags || [];
	}

	const key = `${scheme}://${name}`;
	const label = camelCaseToSentenceCase(_label || name);
	const handler = (payload = {}) => _handler(window.__crotchet, payload);

	window.__crotchet.actions[key] = {
		_id: randomId(),
		name,
		label,
		tags,
		handler,
	};

	window.addEventListener(`menu-item-click:${key}`, async () => {
		console.log("Handling...", label);
		const res = await handler();
		console.log("Handled: ", label, res);
	});
};

export const registerApp = (scheme, _app) => {
	const app = _app();
	let appProps = {};

	let name = scheme,
		load = app;

	if (typeof app != "function") {
		const { name: appName, load: appLoader, open, ...props } = app;

		name = appName || scheme;
		load = appLoader;
		appProps = props;

		appProps.open = (payload) => {
			if (typeof open == "function")
				return open(payload, window.__crotchet);
		};
	}

	window.__crotchet.apps[scheme] = {
		_id: randomId(),
		name: camelCaseToSentenceCase(name),
		load: (payload = {}) => load(payload, window.__crotchet),
		...appProps,
	};
};
