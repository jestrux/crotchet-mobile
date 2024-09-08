import SpotlightSearchPage from "./SpotlightSearchPage";
import { SpotlightProvider, useSpotlightContext } from "./SpotlightContext";
import DraggableElement from "@/components/DraggableElement";
import { dispatch, getPreference, savePreference } from "@/utils";

const getFavoriteCommands = () => getPreference("favorite-commands", []);

const toggleCommandInFavorites = async (command, status) => {
	const favorites = await getFavoriteCommands();
	const newStatus = status ?? !favorites.includes(command);

	await savePreference(
		"favorite-commands",
		newStatus
			? [...favorites, command]
			: favorites.filter((c) => c != command)
	);

	dispatch("app-commands-updated");

	return newStatus;
};

const commandProps = (item, section, favorites) => {
	const faved = favorites.includes(item.name);
	const props = {
		section: faved ? "Favorites" : section,
		pinned: favorites.indexOf(item.name),
		actions: (...payload) => [
			...(typeof item.actions == "function"
				? item.actions(...payload)
				: item.actions
				? item.actions
				: []),
			{
				label: faved ? "Remove from favorites" : "Add to favorites",
				handler: () => {
					window.__crotchet.withLoader(
						() => toggleCommandInFavorites(item.name),
						{
							successMessage: (status) =>
								`${item.label} ${
									status
										? "added to favorites"
										: "removed from favorites"
								}`,
						}
					);
				},
			},
			{
				label: "Move to top",
				handler: () => {
					window.__crotchet.withLoader(
						async () => {
							await toggleCommandInFavorites(item.name, false);
							await toggleCommandInFavorites(item.name, true);
						},
						{
							successMessage: `${item.label} moved to top`,
						}
					);
				},
			},
			{
				section: "Clear",
				label: "Clear Favorites",
				handler: () => {
					window.__crotchet.withLoader(
						async () => {
							await savePreference("favorite-commands", []);
							dispatch("app-commands-updated");
						},
						{
							successMessage: "Favorites cleared",
						}
					);
				},
			},
		],
	};

	return props;
};

const getCommands = async () => {
	const favorites = await getFavoriteCommands();
	const getAutomationsAction = {
		name: "getAutomations",
		label: "Run an Automation",
		trailing: "Action",
		action: {
			label: "Select action",
			handler: () =>
				dispatch("open-page", {
					type: "search",
					resolve: window.__crotchet.actions.getAutomations.handler,
				}),
		},
	};

	return [
		..._.concat(
			getAutomationsAction,
			window.__crotchet.globalActions()
		).map((action) => ({
			name: action.name,
			label: action.label,
			value: action.label,
			trailing: "Action",
			action: {
				label: "Select action",
				handler: action.handler,
			},
			...commandProps(action, "Actions", favorites),
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
			action: {
				label: "View Data Source",
				handler: () =>
					dispatch("open-page", {
						type: "search",
						source: source.name,
						filter: source.filter,
						filters: source.filters,
						listenForUpdates: source.listenForUpdates,
					}),
			},
			...commandProps(source, "Data Source", favorites),
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
		listenForUpdates: (callback = () => {}) => {
			window.addEventListener("app-commands-updated", callback, false);

			return () =>
				window.removeEventListener(
					"app-commands-updated",
					callback,
					false
				);
		},
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
