import { ActionGrid, DataWidget, sourceGet } from "@/crotchet";
import useDataLoader from "@/hooks/useDataLoader";
import PageHeader from "./Page/PageHeader";

const BottomNavPlaceholder = () => {
	return (
		<div
			style={{
				height: "80px",
				marginBottom: "env(safe-area-inset-bottom)",
			}}
		>
			&nbsp;
		</div>
	);
};

export default function Page() {
	const { setHeroCallsheets, setHeroProjects } = window.dataSources || {};
	const quickActions = [
		{
			icon: (
				<svg
					className="size-5"
					viewBox="0 0 24 24"
					fill="none"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
					/>
				</svg>
			),
			label: "Calendar",
		},
		{
			icon: (
				<svg
					className="size-5"
					viewBox="0 0 24 24"
					fill="none"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
					/>
				</svg>
			),
			label: "Callsheets",
			url: "crotchet://search/setHeroCallsheets",
		},
		{
			icon: (
				<svg
					className="size-5"
					viewBox="0 0 24 24"
					fill="none"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
					/>
				</svg>
			),
			label: "Projects",
			url: "crotchet://search/setHeroProjects",
		},
		{
			icon: (
				<svg
					className="size-5"
					viewBox="0 0 24 24"
					fill="none"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25"
					/>
				</svg>
			),
			label: "Contacts",
		},
		{
			icon: (
				<svg
					className="size-5"
					viewBox="0 0 24 24"
					fill="none"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
					/>
				</svg>
			),
			label: "Team",
		},
	];
	const { data: projects } = useDataLoader({
		handler: () =>
			sourceGet(setHeroProjects, {
				limit: 3,
			}),
		listenForUpdates: setHeroProjects.listenForUpdates,
	});
	const { data: callsheets } = useDataLoader({
		handler: () =>
			sourceGet(setHeroCallsheets, {
				limit: 4,
			}),
		listenForUpdates: setHeroCallsheets.listenForUpdates,
	});

	const handleAddEntry = () =>
		window
			.openChoicePicker({
				choices: [
					{ label: "New Project", value: "addSetHeroProject" },
					{ label: "New Callsheet", value: "addSetHeroCallsheet" },
				],
			})
			.then((choice) => window.actions[choice]?.handler?.());

	return (
		<div className="fixed inset-0 overflow-y-auto">
			<PageHeader title="Red Line Studios" />

			<div className="px-5 space-y-8">
				<ActionGrid type="grid" data={quickActions} />

				{projects && (
					<ActionGrid
						title="Latest Projects"
						type="grid"
						data={projects}
						{..._.pick(setHeroProjects, [
							"entryActions",
							"layoutProps",
						])}
					/>
				)}

				{callsheets?.length > 0 && (
					<DataWidget
						title="Recent Callsheets"
						widgetProps={{
							noPadding: true,
						}}
						data={callsheets}
						layout="grid"
						{..._.pick(setHeroCallsheets, [
							"entryActions",
							"layoutProps",
						])}
					/>
				)}

				<BottomNavPlaceholder />
			</div>

			<button
				className="primary-bg dark:bg-content dark:text-inverted shadow border border-content/5 dark:border-content/20 fixed bottom-[90px] right-5 mx-auto z-50 h-11 w-28 flex items-center justify-center gap-2 rounded-full px-3.5 focus:outline-none"
				onClick={handleAddEntry}
			>
				<svg className="h-4 mb-px" viewBox="0 0 24 24">
					<path
						d="M12 4.5v15m7.5-7.5h-15"
						fill="none"
						stroke="currentColor"
						strokeWidth="3.5"
						strokeLinecap="round"
					/>
				</svg>
				<span className="mr-0.5 text-base/none tracking-wide font-semibold uppercase">
					Add
				</span>
			</button>
		</div>
	);
}
