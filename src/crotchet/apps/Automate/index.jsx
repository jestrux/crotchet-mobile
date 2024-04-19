import "./automations";

import { registerAction, registerApp, showToast } from "@/crotchet";

import Automate from "./Automate";

registerAction("runAutomation", {
	icon: (
		<svg viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
			/>
		</svg>
	),
	handler: async ({ name, actions: steps }, { openUrl, utils }) => {
		const actions = steps.map((step) => {
			var actionName = new URL(
				step.replace(
					"crotchet://automation-action/",
					"https://crotchet.app/"
				)
			).pathname
				.substring(1)
				.split("/")
				?.at(0);

			return {
				handler: (data) =>
					openUrl(
						`crotchet://automation-action/${actionName}?${utils.objectToQueryParams(
							{
								...(data || {}),
								runData: utils.urlQueryParamsAsObject(step),
							}
						)}`
					),
			};
		});

		try {
			let lastData;
			for (const action of actions) {
				lastData = await action.handler(lastData);
			}
		} catch (error) {
			return showToast(`Automation ${name} failed`);
		}

		return showToast(`Automation ${name} completed`);
	},
});

registerApp("automate", () => {
	return {
		load(path, { openBottomSheet }) {
			const url = new URL("https://" + path);
			const params = Object.fromEntries(url.searchParams.entries());

			return openBottomSheet({
				fullHeight: true,
				dismissible: false,
				content: <Automate {...params} />,
			});
		},
	};
});
