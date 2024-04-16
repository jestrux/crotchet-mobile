import { registerAutomationAction } from "@/crotchet";

async function readTable(table, { queryDb, openForm, openPage, utils }) {
	let rows;
	const fieldChoices = () =>
		queryDb(table).then((res) => {
			rows = res;
			return Object.keys(rows[0]).filter(
				(item) =>
					!["_id", "_index", "createdAt", "updatedAt"].includes(item)
			);
		});

	let res = await openForm({
		title: "Map db fields",
		field: {
			label: "Field mappings",
			type: "keyvalue",
			defaultValue: {
				title: "",
				"": "",
			},
			key: (data) => data?.table,
			meta: {
				// editable: false,
				schema: {
					image: "image",
					title: "text",
					subtitle: "text",
					progress: "number",
					status: "status",
					action: "url",
				},
				choices: fieldChoices,
			},
			// group: "Widget Content",
		},
	});

	const fieldMappings = Object.entries(utils.cleanObject(res));

	if (!fieldMappings.length) return;

	const data = rows.map((row) =>
		Object.fromEntries(
			fieldMappings.map(([field, dbField]) => [
				field,
				row[dbField] ?? "--",
			])
		)
	);

	return openPage({
		content: [
			{
				type: "data",
				title: table,
				subtitle: `Found ${rows.length} rows`,
				data,
				// value: (
				// 	<div className="divide-y">
				// 		{rows.map((row) => (
				// 			<div key={row._id}>{row[res] ?? "--"}</div>
				// 		))}
				// 	</div>
				// ),
			},
		],
	});
}

registerAutomationAction("readDbTable", {
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
	handler: async (_, appContext) => {
		const { getDbTables, openChoicePicker } = appContext;
		const table = await openChoicePicker({
			title: "Select table",
			choices: getDbTables,
		});

		if (table) return await readTable(table, appContext);

		return;
	},
});

registerAutomationAction("getClipboardContents", {
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
	handler: async (_, { readClipboard, openShareSheet, showToast, utils }) => {
		const { type, value } = await readClipboard();

		if (!value?.length) return showToast("Nothing in clipboard");

		let payload = {
			text: value,
		};

		if (type.includes("image"))
			payload = {
				image: value,
			};

		if (utils.isValidUrl(value))
			payload = {
				url: value,
			};

		return openShareSheet(payload);
	},
});

registerAutomationAction("scanQrCode", {
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

registerAutomationAction("crawlAWebsite", {
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
