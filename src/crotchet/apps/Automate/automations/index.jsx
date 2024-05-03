import { getShareActions, registerAutomationAction } from "@/crotchet";

registerAutomationAction("jsonToView", {
	icon: (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
			/>
		</svg>
	),
	handler: async (
		{ data, meta = {}, savedData, runData },
		{ openForm, utils }
	) => {
		if (!data) throw "No valid data provided";

		const fields =
			meta?.fields || Object.keys(utils.objectExcept(data[0], ["_id"]));

		const fieldSchemaMappings = {
			index: { type: "text", matches: ["index", "_index"] },
			video: { type: "text", matches: ["video", "videourl"] },
			image: {
				type: "text",
				matches: [
					"image",
					"picture",
					"poster",
					"dp",
					"artwork",
					"imageurl",
				],
			},
			title: {
				type: "text",
				matches: ["title", "name", "heading", "question"],
			},
			subtitle: {
				type: "text",
				matches: ["subtitle", "description", "answer"],
			},
			progress: { type: "text", matches: ["progress", "percent"] },
			status: { type: "text", matches: ["status", "checked"] },
			action: { type: "text", matches: ["action", "url", "link"] },
			share: { type: "text", matches: ["share"] },
		};

		const getDefaultFields = (fields) => {
			return fields.reduce(
				(matchedFields, field) => {
					const unmatchedFields = Object.entries(
						fieldSchemaMappings
					).filter((key) => !matchedFields[key]?.length);

					const match = unmatchedFields.find(([, { matches }]) =>
						matches.find(
							(match) =>
								match ==
								field
									.toLowerCase()
									.replaceAll("_", "")
									.replaceAll("-", "")
						)
					)?.[0];

					if (match) matchedFields[match] = field;

					return matchedFields;
				},
				{ title: "" }
			);
		};

		const fieldDefaultValues =
			savedData?.form?.fieldMappings || getDefaultFields(fields);

		let layoutProps = runData?.fieldMappings
			? runData
			: await openForm({
					fullHeight: false,
					title: "Select layout",
					data: savedData?.form || {
						layout: "list",
						columns: "2",
						fieldMappings: fieldDefaultValues,
					},
					fields: {
						fieldMappings: {
							group: "Data Field Mapping",
							label: "Map fields",
							type: "keyvalue",
							key: (data) => data?.table,
							meta: {
								schema: Object.fromEntries(
									Object.entries(fieldSchemaMappings).map(
										([field, { type }]) => [field, type]
									)
								),
								choices: _.map(
									utils.objectFieldChoices(fields),
									"value"
								),
							},
						},
						layout: {
							type: "radio",
							choices: ["list", "card", "grid"],
							group: "Layout Properties",
						},
						columns: {
							type: "radio",
							choices: ["2", "3"],
							show: (state) => state.layout == "grid",
							group: "Layout Properties",
						},
					},
			  });

		const fieldMappings = Object.entries(
			utils.cleanObject(layoutProps?.fieldMappings)
		);

		if (!fieldMappings.length) return null;

		const viewData = data.map((row) =>
			Object.fromEntries(
				fieldMappings.map(([field, dbField]) => [
					field,
					row[dbField] ?? "--",
				])
			)
		);

		return {
			type: "viewData",
			data: viewData,
			meta: {
				layoutProps,
			},
			state: {
				form: layoutProps,
			},
			actions: ["previewData"],
		};
	},
});

registerAutomationAction("previewData", {
	icon: (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
			/>
		</svg>
	),
	handler: async ({ data, meta } = {}, { openSearchPage, showToast }) => {
		if (!data) return showToast("No data");

		openSearchPage({
			type: "data",
			title: "Data preview",
			source: {
				...(meta || {}),
				handler: () => {
					return data;
				},
			},
		});

		return {
			type: "exit",
		};
	},
});

/* Global Actions */
registerAutomationAction("readDataSource", {
	global: true,
	icon: (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
			/>
		</svg>
	),
	handler: async ({ runData }, appContext) => {
		const { dataSources, openChoicePicker, showToast } = appContext;
		const searchableDataSources = _.sortBy(
			_.filter(
				Object.values(dataSources),
				({ searchable }) => !searchable
			)
		).map((source) => ({
			_id: source._id,
			label: source.label,
			value: source.name,
		}));

		const source =
			runData?.source ||
			(await openChoicePicker({
				title: "Select table",
				choices: searchableDataSources,
			}));

		const actualSource = dataSources?.[source];
		if (!_.isFunction(actualSource?.get)) {
			showToast(`${source} isn't a valid source`);
			return null;
		}

		const data = await actualSource.get();

		if (!data?.length) {
			showToast(`${source} has no data`);
			return null;
		}

		return {
			type: "jsonArray",
			actions: ["jsonToView"],
			data,
			state: {
				form: { source },
			},
			meta: {
				source,
			},
		};
	},
});

registerAutomationAction("networkRequest", {
	global: true,
	icon: (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
			/>
		</svg>
	),
	handler: async (_, showToast) => {
		return showToast("Make network request");
	},
});

registerAutomationAction("readDbTable", {
	global: true,
	icon: (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
			/>
		</svg>
	),
	handler: async ({ runData, savedData }, appContext) => {
		const { utils, getDbTables, queryDb, openChoicePicker } = appContext;
		let tables;
		const table =
			runData?.table ||
			(await openChoicePicker({
				title: "Select table",
				choices: savedData?.tables
					? savedData.tables
					: () =>
							getDbTables().then((res) => {
								tables = res;
								return res;
							}),
			}));

		if (!table) return null;

		const data = await queryDb(table);
		const fields = Object.keys(
			utils.objectExcept(data[0], [
				"_id",
				"_index",
				"createdAt",
				"updatedAt",
			])
		);

		return {
			type: "jsonArray",
			actions: ["jsonToView"],
			data,
			state: {
				tables,
				form: { table },
			},
			meta: {
				fields,
			},
		};
	},
});

registerAutomationAction("readClipboard", {
	global: true,
	icon: (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
			/>
		</svg>
	),
	handler: async (_, { readClipboard, showToast, utils }) => {
		const { type, value } = await readClipboard();
		const payload = utils.processShareData(value, type);

		if (!payload) return showToast("Nothing in clipboard");

		const shareActions = getShareActions(payload)
			.map((action) => action.name)
			.filter((action) => action);

		return {
			type: "jsonObject",
			actions: shareActions,
			data: payload,
		};
	},
});

registerAutomationAction("scanQrCode", {
	global: true,
	label: "Scan QR",
	icon: (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
			/>
		</svg>
	),
	handler: async (_, { showToast }) => {
		showToast("Scan QR Code");
		return;
	},
});

registerAutomationAction("takePicture", {
	global: true,
	icon: (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
			/>
		</svg>
	),
	handler: async (_, { showToast }) => {
		showToast("Take a Picture");
		return;
	},
});

registerAutomationAction("connectSpotify", {
	global: true,
	color: "#1CD05D",
	icon: (
		<svg className="w-4" fill="currentColor" viewBox="0 0 24 24">
			<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
		</svg>
	),
	handler: async (_, { showToast }) => {
		showToast("Connect Spotify");
		return;
	},
});

registerAutomationAction("crawlWebsite", {
	global: true,
	icon: (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082"
			/>
		</svg>
	),
	handler: async (_, { readClipboard, openShareSheet, showToast, utils }) => {
		const { value: clibpoardValue } = await readClipboard();
		let url;

		if (!clibpoardValue?.length && utils.isValidUrl(clibpoardValue))
			url = clibpoardValue;
		else url = "https://pitch.com";

		let res = await utils.crawlUrl(url);

		if (!res?.meta) return showToast("Failed to crawl: " + url);

		const { meta, ...crawlRes } = res;
		let payload = {
			url,
			...meta,
			...crawlRes,
		};

		return openShareSheet(payload);
	},
});
