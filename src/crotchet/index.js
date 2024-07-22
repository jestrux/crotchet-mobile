import { getterFields, sourceGet } from "@/providers/data";
import dataSourceProviders, {
	getCrotchetDataSourceProvider,
} from "@/providers/data/dataSourceProviders";
import {
	camelCaseToSentenceCase,
	cleanObject,
	objectExcept,
	objectTake,
	openUrl,
	randomId,
	shuffle,
} from "@/utils";
import { WidgetsBridgePlugin } from "capacitor-widgetsbridge-plugin";
import { useEffect, useRef, useState } from "react";

export { default as clsx } from "clsx";
export { default as useEventListener } from "@/hooks/useEventListener";
export { default as useKeyDetector } from "@/hooks/useKeyDetector";
export { useSourceGet, sourceGet } from "@/providers/data";
export { useState, useEffect, useRef } from "react";
export { default as usePrefsState } from "@/providers/prefs/usePrefsState";
export { useAppContext } from "@/providers/app";
export { default as Input } from "@/components/Input";
export { default as SearchPage } from "@/components/Pages/SearchPage";
export { default as WidgetWrapper } from "@/components/WidgetWrapper";
export { default as Widget } from "@/components/Widget";
export { default as DataFetcher } from "@/providers/data/DataFetcher";
export { default as DataWidget } from "@/components/DataWidget";
export { default as ListItem } from "@/components/ListItem";
export { default as Loader } from "@/components/Loader";
export { default as ActionList } from "@/components/ActionList";
export { default as ColorPicker } from "@/components/ColorPicker";
export { default as AudioPlayer } from "@/crotchet/apps/AudioPlayer/AudioPlayer";
export { default as SliderInput } from "@/components/SliderInput";
export { default as ActionGrid } from "@/components/ActionGrid";
export { default as useRemoteButtons } from "@/crotchet/apps/Remote/useRemoteButtons";

export * from "@/utils";

export * as utils from "@/utils";

export const useOnInit = (callback) => {
	const initialized = useRef(false);

	useEffect(() => {
		if (!initialized.current) {
			callback();
			initialized.current = true;
		}

		return () => (initialized.current = false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
};

export const onActionClick = (
	action,
	{ propagate, actionTypeMap = {}, confirm } = {}
) => {
	return async (e, ...args) => {
		if (!propagate && typeof e?.stopPropagation == "function")
			e.stopPropagation();

		if (!action) return null;

		if (typeof confirm == "function" && action?.destructive) {
			const res = await confirm({
				title: action.label + "?",
				actionType: "danger",
				okayText: action.confirmText || "Yes, Continue",
			});

			if (!res) return;
		}

		if (typeof action.handler == "function")
			return await Promise.resolve(action.handler(e, ...args));
		else if (typeof action.onClick == "function")
			return await Promise.resolve(action.onClick(e, ...args));
		else if (typeof actionTypeMap[action?.type] == "function")
			return await Promise.resolve(
				actionTypeMap[action?.type](e, ...args)
			);
		else if (action.url) return await Promise.resolve(openUrl(action.url));
		else if (typeof action == "function")
			return await Promise.resolve(action(e, ...args));
		else if (typeof action == "string")
			return await Promise.resolve(openUrl(action));

		return null;
	};
};

export const useActionClick = (
	action,
	{ propagate = false, actionTypeMap = {} } = {}
) => {
	const loadingRef = useRef();
	const [loading, setLoading] = useState(false);

	const onClick = async (e) => {
		if (!action) return null;

		loadingRef.current = setTimeout(() => {
			setLoading(true);
		}, 500);

		await onActionClick(action, { propagate, actionTypeMap })(e);

		setLoading(false);

		if (loadingRef.current) clearInterval(loadingRef.current);
	};

	return {
		onClick,
		loading,
	};
};

const updateDataSourceWidget = async (name, key, value) => {
	const dataSources = window.__crotchet.dataSources;
	const validDataSources = Object.keys(dataSources)
		.filter((key) => ["db"].includes(dataSources[key]?.provider))
		.join(", ");

	if (!validDataSources.includes(name)) return;

	if (key && value) {
		try {
			await WidgetsBridgePlugin.setItem({
				key: name + key,
				value: JSON.stringify(
					objectTake(value, [
						"video",
						"image",
						"title",
						"subtitle",
						"url",
					])
				),
				group: "group.tz.co.crotchet",
			});

			await WidgetsBridgePlugin.reloadTimelines({
				ofKind: "CrotchetWidget",
			});
		} catch (error) {
			// alert(error);
		}

		return;
	}

	try {
		await WidgetsBridgePlugin.setItem({
			key: "dataSources",
			value: validDataSources,
			group: "group.tz.co.crotchet",
		});
	} catch (error) {
		//
	}

	const source = dataSources[name];

	if (!_.isFunction(source.get)) return;

	const data = await source.get();

	if (!data.length) return;

	try {
		await WidgetsBridgePlugin.setItem({
			key: name + "Stat",
			value: JSON.stringify({
				title: source.label,
				subtitle: data.length + " records",
			}),
			group: "group.tz.co.crotchet",
		});
	} catch (error) {
		// console.log("Update widget: error: ", error);
	}

	const latest = data[0];
	if (latest?.title) {
		const latestData = {
			video: latest.video,
			image: latest.image,
			title: latest.title,
			subtitle: latest.subtitle,
			url: latest.url,
		};

		try {
			await WidgetsBridgePlugin.setItem({
				key: name + "Latest",
				value: JSON.stringify(latestData),
				group: "group.tz.co.crotchet",
			});
		} catch (error) {
			//
		}
	}

	const random = shuffle(shuffle(data))[0];

	if (random?.title) {
		const randomData = {
			video: random.video,
			image: random.image,
			title: random.title,
			subtitle: random.subtitle,
			url: random.url,
		};

		try {
			await WidgetsBridgePlugin.setItem({
				key: name + "Random",
				value: JSON.stringify(randomData),
				group: "group.tz.co.crotchet",
			});

			// await await WidgetsBridgePlugin.reloadAllTimelines();
			await WidgetsBridgePlugin.reloadTimelines({
				ofKind: "CrotchetWidget",
			});
		} catch (error) {
			//
		}
	}

	return;
};

export const registerDataSource = (provider, name, props = {}) => {
	if (provider.startsWith("crotchet://")) {
		const _source = getCrotchetDataSourceProvider(
			provider.replace("crotchet://", ""),
			name,
			objectExcept(props, getterFields)
		);

		if (!_source) return;

		props = {
			...props,
			..._source,
			...objectTake(props, getterFields),
		};
	}

	const label = camelCaseToSentenceCase(
		name.replace("-", " ").replace("_", " ")
	);

	let getter, insertRow, updateRow, deleteRow, listenForUpdates;
	const sourceProvider = dataSourceProviders(provider, { name, ...props });

	if (typeof sourceProvider == "function") getter = sourceProvider;
	else {
		if (typeof props.handler == "function") getter = props.handler;
		else if (typeof sourceProvider.fetch == "function") {
			getter = sourceProvider.fetch;
			insertRow = sourceProvider.insertRow;
			updateRow = sourceProvider.updateRow;
			deleteRow = sourceProvider.deleteRow;
			listenForUpdates = sourceProvider.listenForUpdates;
		} else return console.error(`Unkown data provider: ${provider}`);
	}

	const handler = async (payload) => getter(payload, window.__crotchet);

	const get = ({ shuffle, limit, first, single, ...payload } = {}) =>
		sourceGet(
			{
				handler,
			},
			{
				...objectTake(props, getterFields),
				shuffle,
				limit,
				first,
				single,
				...payload,
			}
		);

	const latest = async (payload = {}) =>
		await get({ single: true, ...payload });

	const random = async (payload = {}) => {
		const res = await get({ random: true, single: true, ...payload });
		setTimeout(() => {
			updateDataSourceWidget(name, "Random", res);
		}, 300);
		return res;
	};

	window.__crotchet.dataSources[name] = {
		...objectExcept(props, getterFields),
		_id: randomId(),
		provider,
		name,
		label,
		...objectTake(props, getterFields),
		handler,
		get,
		random,
		latest,
		insertRow,
		updateRow,
		deleteRow,
		listenForUpdates,
	};

	setTimeout(() => {
		updateDataSourceWidget(name);
	}, 10);

	const pendingDataSources = window.__crotchet.pendingDataSources?.[name];

	if (pendingDataSources) {
		pendingDataSources.forEach(([provider, childName, props], index) => {
			registerDataSource(provider, childName, props);
			delete window.__crotchet.pendingDataSources[name][index];
		});

		window.__crotchet.pendingDataSources = cleanObject(
			window.__crotchet.pendingDataSources
		);
	}
};

export const registerAction = (name, action) => {
	let _label = name,
		_handler = action,
		actions,
		tags = [],
		type,
		icon,
		global = false,
		context,
		match,
		scheme,
		sheet,
		shortcut,
		mobileOnly = false;

	if (typeof action != "function") {
		icon = action.icon;
		type = action.type;
		global = action.global;
		context = action.context;
		match = action.match;
		scheme = action.scheme;
		sheet = action.sheet;
		shortcut = action.shortcut;
		mobileOnly = action.mobileOnly;
		_label = action.label;
		_handler = action.handler
			? action.handler
			: action.url
			? () => openUrl(action.url)
			: null;
		actions = action.actions || [];
		tags = action.tags || [];
	}

	const label = camelCaseToSentenceCase(
		(_label || name).replace("-", " ").replace("_", " ")
	);

	const handler = (payload) => _handler(payload ?? {}, window.__crotchet);

	window.__crotchet.actions[name] = {
		_id: randomId(),
		type,
		icon,
		name,
		label,
		tags,
		global,
		context,
		match,
		scheme,
		sheet,
		shortcut,
		mobileOnly,
		handler,
		actions,
	};

	window.addEventListener(`menu-item-click:${name}`, async () => {
		// console.log("Handling...", label);
		await handler();
		// console.log("Handled: ", label, res);
	});
};

export const registerAutomationAction = (name, action) => {
	let _label = name,
		_handler = action,
		tags = [],
		icon,
		color,
		match,
		global,
		mobileOnly = false;

	if (typeof action != "function") {
		icon = action.icon;
		color = action.color;
		match = action.match;
		global = action.global;
		mobileOnly = action.mobileOnly;
		_label = action.label;
		_handler = action.handler
			? action.handler
			: action.url
			? () => openUrl(action.url)
			: null;
		tags = action.tags || [];
	}

	const label = camelCaseToSentenceCase(
		(_label || name).replace("-", " ").replace("_", " ")
	);

	const handler = (payload) => _handler(payload ?? {}, window.__crotchet);

	window.__crotchet.automationActions[name] = {
		_id: randomId(),
		automation: true,
		icon,
		color,
		name,
		label,
		tags,
		match,
		global,
		mobileOnly,
		handler,
	};
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
		name: camelCaseToSentenceCase(name.replace("-", " ").replace("_", " ")),
		load: (payload = {}) => load(payload, window.__crotchet),
		...appProps,
	};
};

export const registerBackgroundApp = (scheme, _app) => {
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

	window.__crotchet.backgroundApps[scheme] = {
		_id: randomId(),
		name: camelCaseToSentenceCase(name.replace("-", " ").replace("_", " ")),
		load: (payload = {}) => load(payload, window.__crotchet),
		...appProps,
	};
};

const createGenericAction = (name, action) => {
	let _label = name,
		_handler = action,
		icon;

	if (typeof action != "function") {
		icon = action.icon;
		_label = action.label;
		_handler = action.handler
			? action.handler
			: action.url
			? () => openUrl(action.url)
			: null;
	}

	const label = camelCaseToSentenceCase(
		(_label || name).replace("-", " ").replace("_", " ")
	);

	const handler = (payload) => _handler(payload ?? {}, window.__crotchet);

	return {
		_id: randomId(),
		icon,
		name,
		label,
		handler,
	};
};

export const registerBackgroundAction = (name, action) => {
	window.__crotchet.backgroundActions[name] = createGenericAction(
		name,
		action
	);
};

export const registerRemoteAction = (name, action) => {
	window.__crotchet.remoteActions[name] = createGenericAction(name, action);
};

export const registerRemoteApp = (scheme, _app) => {
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

	window.__crotchet.remoteApps[scheme] = {
		_id: randomId(),
		name: camelCaseToSentenceCase(name.replace("-", " ").replace("_", " ")),
		load: (payload = {}) => load(payload, window.__crotchet),
		...appProps,
	};
};

export const registerActionSheet = (name, props) => {
	const _handler = (...args) => {
		if (_.isArray(props)) {
			return {
				actions: props,
			};
		}

		if (_.isFunction(props)) return props(...args);

		return props;
	};

	const handler = async (payload) => {
		let changeHander = (props) => {
			console.log("Sheet data changed: ", props);
		};

		const props = await Promise.resolve(
			_handler(payload, window.__crotchet, (data) => changeHander(data))
		);

		const onChange = (callback) => {
			if (typeof callback == "function") changeHander = callback;
		};

		// if (_.isArray(props.actions) && props.actions.length == 1) {
		// 	return props.actions[0].handler({
		// 		...(payload || {}),
		// 		...(props || {}),
		// 	});
		// }

		return window.__crotchet.openActionSheet(
			{
				title: camelCaseToSentenceCase(name),
				...(payload || {}),
				...(props || {}),
			},
			onChange
		);
	};

	window.__crotchet.actionSheets[name] = {
		_id: randomId(),
		name,
		handler,
	};
};
