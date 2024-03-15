import dataSourceProviders from "@/providers/data/dataSourceProviders";
import { camelCaseToSentenceCase, openUrl, randomId, shuffle } from "@/utils";

export { useAppContext } from "@/providers/app";
export { default as SearchPage } from "@/components/Pages/SearchPage";
export { default as Widget } from "@/components/Widget";
export { default as DataFetcher } from "@/providers/data/DataFetcher";
export { default as DataWidget } from "@/components/DataWidget";
export { default as ListItem } from "@/components/ListItem";
export { default as Loader } from "@/components/Loader";

export * from "@/utils";

export const registerDataSource = (provider, name, props = {}) => {
	const { fieldMap, mapEntry, searchable, searchFields, ..._props } = props;
	const label = camelCaseToSentenceCase(name);
	const _handler = dataSourceProviders(provider, _props);

	if (typeof _handler != "function")
		throw `Unkown data provider: ${provider}`;

	const handler = (payload) => _handler(payload);

	const get = async (payload = {}) => handler(payload);
	const random = (payload) =>
		get(payload).then((res) => shuffle(shuffle(res))[0]);

	window.__crotchet.dataSources[name] = {
		..._props,
		_id: randomId(),
		name,
		label,
		fieldMap,
		mapEntry,
		searchable,
		searchFields,
		handler,
		get,
		random,
	};
};

export const registerAction = (name, action) => {
	let _label = name,
		_handler = action,
		tags = [],
		global = false;

	if (typeof action != "function") {
		global = action.global;
		_label = action.label;
		_handler = action.url ? () => openUrl(action.url) : action.handler;
		tags = action.tags || [];
	}

	// const key = `${scheme}://${name}`;
	const label = camelCaseToSentenceCase(_label || name);
	const handler = (...params) => _handler({ ...window.__crotchet, params });

	window.__crotchet.actions[name] = {
		_id: randomId(),
		name,
		label,
		tags,
		global,
		handler,
	};

	window.addEventListener(`menu-item-click:${name}`, async () => {
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
