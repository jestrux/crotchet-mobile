import { sourceGet } from "@/providers/data";
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
} from "@/utils";
import { useEffect, useRef, useState } from "react";

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
	{ propagate, actionTypeMap = {} } = {}
) => {
	return async (e) => {
		if (!propagate && typeof e?.stopPropagation == "function")
			e.stopPropagation();

		if (!action) return null;

		try {
			if (typeof action.handler == "function")
				return await Promise.resolve(action.handler());
			else if (typeof action.onClick == "function")
				return await Promise.resolve(action.onClick());
			else if (typeof actionTypeMap[action?.type] == "function")
				return await Promise.resolve(actionTypeMap[action?.type]());
			else if (action.url)
				return await Promise.resolve(openUrl(action.url));
			else if (typeof action == "function")
				return await Promise.resolve(action());
			else if (typeof action == "string")
				return await Promise.resolve(openUrl(action));
		} catch (error) {
			console.log("Action click error: ", error);
		}

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

export const registerDataSource = (provider, name, props = {}) => {
	const sourceFields = ["fieldMap", "mapEntry", "searchable", "searchFields"];

	if (provider.startsWith("crotchet://")) {
		const _source = getCrotchetDataSourceProvider(
			provider.replace("crotchet://", ""),
			name,
			objectExcept(props, sourceFields)
		);

		if (!_source) return;

		props = {
			...props,
			..._source,
			...objectTake(props, sourceFields),
		};
	}

	const label = camelCaseToSentenceCase(
		name.replace("-", " ").replace("_", " ")
	);
	const _handler = dataSourceProviders(provider, props) || props.handler;

	if (typeof _handler != "function")
		return console.error(`Unkown data provider: ${provider}`);

	const handler = (payload) => _handler(payload, window.__crotchet);

	const get = ({ shuffle, limit, single, ...payload } = {}) =>
		sourceGet(
			{
				handler,
			},
			{
				...objectTake(props, sourceFields),
				shuffle,
				limit,
				single,
				...payload,
			}
		);

	const random = async (payload = {}) =>
		get({ random: true, single: true, ...payload });

	window.__crotchet.dataSources[name] = {
		...objectExcept(props, sourceFields),
		_id: randomId(),
		name,
		label,
		...objectTake(props, sourceFields),
		handler,
		get,
		random,
	};

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
		tags = [],
		type,
		icon,
		global = false,
		context,
		match,
		mobileOnly = false;

	if (typeof action != "function") {
		icon = action.icon;
		type = action.type;
		global = action.global;
		context = action.context;
		match = action.match;
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
		mobileOnly,
		handler,
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
		mobileOnly = false;

	if (typeof action != "function") {
		icon = action.icon;
		color = action.color;
		match = action.match;
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
		icon,
		color,
		name,
		label,
		tags,
		match,
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
