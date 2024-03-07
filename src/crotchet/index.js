import { camelCaseToSentenceCase, randomId } from "@/utils";

export * from "@/utils";

export const registerApp = (scheme, _app) => {
	const app = _app();

	let name = scheme,
		handler = app;

	if (typeof app != "function") {
		name = app.name;
		handler = app.handler;
	}

	window.__crotchet.apps[scheme] = {
		_id: randomId(),
		name: camelCaseToSentenceCase(name),
		handler: (payload = {}) => handler(payload, window.__crotchet),
	};
};
