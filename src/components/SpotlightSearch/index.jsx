import SpotlightSearchPage from "./SpotlightSearchPage";
import { SpotlightProvider, useSpotlightContext } from "./SpotlightContext";
import DraggableElement from "@/components/DraggableElement";
import { dispatch } from "@/utils";

const getCommands = () => {
	return [
		{
			name: "getAutomations",
			label: "Run an Automation",
			trailing: "Action",
			section: window.__crotchet.favoriteCommands.includes(
				"getAutomations"
			)
				? "Favorites"
				: "Actions",
			action: {
				label: "Select action",
				handler: () =>
					dispatch("open-page", {
						type: "search",
						resolve:
							window.__crotchet.actions.getAutomations.handler,
					}),
			},
			actions: () => [
				{
					label: "Add to favorites",
					handler: () => {
						window.__crotchet.withLoader(() => {}, {
							successMessage:
								"Run an Automation added to favorites",
						});
					},
				},
			],
		},
		...window.__crotchet.globalActions().map((action) => ({
			name: action.name,
			label: action.label,
			value: action.label,
			trailing: "Action",
			section: window.__crotchet.favoriteCommands.includes(action.name)
				? "Favorites"
				: "Actions",
			action: {
				label: "Select action",
				handler: action.handler,
			},
			actions: (...payload) => [
				...(typeof action.actions == "function"
					? action.actions(...payload)
					: action.actions
					? action.actions
					: []),
				{
					label: "Add to favorites",
					handler: () => {
						window.__crotchet.withLoader(() => {}, {
							successMessage: `${action.label} added to favorites`,
						});
					},
				},
			],
		})),
		..._.sortBy(
			_.filter(
				Object.values(window.__crotchet.dataSources),
				({ searchable }) => !searchable
			),
			"label"
		).map((source) => ({
			name: source.name,
			label: source.label,
			value: source.label,
			trailing: "Data Source",
			section: window.__crotchet.favoriteCommands.includes(source.name)
				? "Favorites"
				: "Data Source",
			action: {
				label: "View Data Source",
				handler: () =>
					dispatch("open-page", {
						type: "search",
						source: source.name,
					}),
			},
			actions: (...payload) => [
				...(typeof source.actions == "function"
					? source.actions(...payload)
					: source.actions
					? source.actions
					: []),
				{
					label: "Add to favorites",
					handler: () => {
						window.__crotchet.withLoader(() => {}, {
							successMessage: `${source.label} added to favorites`,
						});
					},
				},
			],
		})),
	];
};

export function SpotlightSearchWrapper({ open, children }) {
	const {
		spotlightRef,
		spotlightInnerPages,
		hideSpotlightSearch,
		popCurrentSpotlightPage,
		popSpotlightToRoot,
		...props
	} = useSpotlightContext();

	const rootPage = {
		open,
		id: "root",
		_id: "root",
		type: "search",
		resolve: getCommands,
	};

	return (
		<DraggableElement persistKey="spotlightPlacement">
			{(dragProps) => (
				<>
					<SpotlightSearchPage
						key={spotlightRef}
						{...props}
						page={rootPage}
						open={open && !spotlightInnerPages.length}
						onClose={() => hideSpotlightSearch()}
						dragProps={dragProps}
					>
						{children}
					</SpotlightSearchPage>

					{spotlightInnerPages.map((page) => (
						<SpotlightSearchPage
							key={spotlightRef + "-" + page.id}
							page={page}
							open={
								open && page.id == spotlightInnerPages.at(-1).id
							}
							onClose={() => hideSpotlightSearch()}
							onPopAll={popSpotlightToRoot}
							onPop={popCurrentSpotlightPage}
							dragProps={dragProps}
						>
							{page.content}
						</SpotlightSearchPage>
					))}
				</>
			)}
		</DraggableElement>
	);
}

export default function SpotlightSearch({ children, open }) {
	return (
		<SpotlightProvider>
			<SpotlightSearchWrapper open={open}>
				{children}
			</SpotlightSearchWrapper>
		</SpotlightProvider>
	);
}
