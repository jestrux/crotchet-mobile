import { useEffect } from "react";

import ListWidget from "@/components/ListWidget";
import WidgetWrapper from "@/components/WidgetWrapper";

import { useDelayedAirtableFetch } from "@/providers/airtable/useAirtable";
import useLocalStorageState from "@/hooks/useLocalStorageState";

export default function Widgets({ page: pageProps }) {
	const page = pageProps?.label ?? "Home";
	const [widgets, setWidgets] = useLocalStorageState(
		"authUserWidgets" + page
	);
	const { fetch } = useDelayedAirtableFetch({
		table: "widgets",
	});

	const fetchWidgets = async () => {
		const res = await fetch({
			// filters: {
			// 	owner_name: "authUserName|all",
			// 	page,
			// },
		});
		const widgets = res
			.filter(({ properties }) => properties?.length)
			.map(({ label, properties }) => {
				return {
					label,
					...JSON.parse(properties),
				};
			});

		setWidgets(widgets);
	};

	useEffect(() => {
		document.addEventListener("widgets-updated", fetchWidgets, false);

		return () => {
			document.removeEventListener(
				"widgets-updated",
				fetchWidgets,
				false
			);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		fetchWidgets();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageProps]);

	if (!widgets) return null;

	const simpleGrid = pageProps?.simpleGrid ?? false;

	return (
		<div className="p-3 grid items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5 xl:gap-8">
			{widgets.map((widget, index) => {
				const { label, actions, ...props } = widget;
				let actionArray = Object.entries(actions || {});
				actionArray = !actionArray.length
					? null
					: actionArray.map(([label, action]) => {
							action.label = label;

							if (!action.table) action.table = props.table;
							if (!action.icon) action.icon = "add";
							if (!action.type) action.type = "form";

							return action;
					  });

				return (
					<WidgetWrapper
						key={index}
						aspectRatio={simpleGrid ? 1 : "auto"}
					>
						<ListWidget
							cacheData={true}
							page={page}
							widgetProps={{
								title: label,
								actions: actionArray,
							}}
							{...props}
						/>
					</WidgetWrapper>
				);
			})}
		</div>
	);
}
