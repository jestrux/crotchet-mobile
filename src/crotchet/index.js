import { sourceGet } from "@/providers/data";
import dataSourceProviders from "@/providers/data/dataSourceProviders";
import { camelCaseToSentenceCase, openUrl, randomId } from "@/utils";
import { useEffect, useRef, useState } from "react";

export { useSourceGet, sourceGet } from "@/providers/data";
export { useState, useEffect, useRef } from "react";
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

export const useOnInit = (callback) => {
	const initialized = useRef(false);

	useEffect(() => {
		if (!initialized.current) {
			callback();
			initialized.current = true;
		}

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
			if (typeof action == "string")
				return await Promise.resolve(openUrl(action));
			else if (typeof action == "function")
				return await Promise.resolve(action());
			if (action.url) return await Promise.resolve(openUrl(action.url));
			else if (typeof action.onClick == "function")
				return await Promise.resolve(action.onClick());
			else if (typeof actionTypeMap[action?.type] == "function")
				return await Promise.resolve(actionTypeMap[action?.type]());
		} catch (error) {
			//
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
	const { fieldMap, mapEntry, searchable, searchFields, ..._props } = props;
	const label = camelCaseToSentenceCase(
		name.replace("-", " ").replace("_", " ")
	);
	const _handler = dataSourceProviders(provider, _props) || _props.handler;

	if (typeof _handler != "function")
		throw `Unkown data provider: ${provider}`;

	const handler = (payload) => _handler(payload, window.__crotchet);

	const get = ({ shuffle, limit, single, ...payload } = {}) =>
		sourceGet(
			{
				handler,
			},
			{ shuffle, limit, single, ...payload }
		);

	const random = async (payload = {}) =>
		get({ shuffle: true, single: true, ...payload });

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
		global = false,
		mobileOnly = false;

	if (typeof action != "function") {
		global = action.global;
		mobileOnly = action.mobileOnly;
		_label = action.label;
		_handler = action.url ? () => openUrl(action.url) : action.handler;
		tags = action.tags || [];
	}

	const label = camelCaseToSentenceCase(
		(_label || name).replace("-", " ").replace("_", " ")
	);
	const handler = (...params) => _handler({ ...window.__crotchet, params });

	window.__crotchet.actions[name] = {
		_id: randomId(),
		name,
		label,
		tags,
		global,
		mobileOnly,
		handler,
	};

	window.addEventListener(`menu-item-click:${name}`, async () => {
		// console.log("Handling...", label);
		await handler();
		// console.log("Handled: ", label, res);
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
		name: camelCaseToSentenceCase(name.replace("-", " ").replace("_", " ")),
		load: (payload = {}) => load(payload, window.__crotchet),
		...appProps,
	};
};
