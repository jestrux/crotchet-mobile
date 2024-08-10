import {
	useAppContext,
	registerDataSource,
	onDesktop,
	registerAction,
} from "@/crotchet";
import Page from "./Page";
import NavItems from "./Nav";

const projectColors = [
	"#3b82f6", // blue
	"#22c55e", // green
	"#f59e0b", // amber
	"#f43f5e", // pink
	"#84cc16", // lime
	"#06b6d4", // cyan
	"#2e1065", // violet
	"#a855f7", // purple
	"#451a03", // brown
];

registerDataSource("db", "setHeroProjects", {
	formFields: {
		title: "text",
		plan_type: {
			label: "Plan Type",
			type: "radio",
			choices: [
				{
					label: "Short Shoot",
					value: "short",
				},
				{
					label: "Long Shoot",
					value: "long",
				},
			],
			defaultValue: "short",
		},
		color: {
			type: "radio",
			choiceType: "color",
			choices: projectColors,
			defaultValue: projectColors[0],
		},
	},
	mapEntry(item) {
		return {
			...item,
			subtitle: item.type,
			icon: `<div
				class="size-7 rounded-full p-1.5"
				style="background-color: ${item.color}; color: white"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke-width="1.8"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
					/>
				</svg>
			</div>
			`,
		};
	},
	layoutProps: {
		layout: "grid",
		aspectRatio: "2/0.8",
		meta: {
			inset: true,
			imagePlaceholder: `
				<svg class="size-7" viewBox="0 0 24 24" fill="none" stroke-width="1" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
				</svg>
			`,
		},
	},
	filters: [
		{ label: "All", value: "" },
		{ label: "Short Shoot", value: "short" },
		{ label: "Long Shoot", value: "long" },
	],
	actions: () => [window.actions.addSetHeroProject],
	entryActions: (item) => {
		return [
			{
				label: "Edit Project",
				handler: () => window.actions.editSetHeroProject.handler(item),
			},
			{
				label: "Delete Project",
				destructive: true,
				handler: async () => {
					const confirmed = await window.confirmDangerousAction();

					if (!confirmed) return;

					window.withLoader(
						window.dataSources.setHeroProjects.deleteRow(item._id),
						{
							successMessage: "Project deleted",
							errorMessage: "Failed to delete project",
						}
					);
				},
			},
			...(!onDesktop() ? [] : [window.actions.addSetHeroProject]),
		];
	},
	meta: {
		colors: projectColors,
	},
});

registerAction("addSetHeroProject", async () =>
	window.openAlertForm({
		title: "New Project",
		fields: window.dataSources.setHeroProjects.formFields,
		action: {
			label: "Create",
			handler: (project) =>
				window.withLoader(
					window.dataSources.setHeroProjects.insertRow(project),
					{
						successMessage: "Project added",
						errorMessage: "Failed to add project",
					}
				),
		},
	})
);

registerAction("editSetHeroProject", async (project) =>
	window.openAlertForm({
		title: "Edit Project",
		data: project,
		fields: window.dataSources.setHeroProjects.formFields,
		action: {
			label: "Save",
			handler: (project) =>
				window.withLoader(
					window.dataSources.setHeroProjects.updateRow(
						project._id,
						project
					),
					{
						successMessage: "Project updated",
						errorMessage: "Failed to update project",
					}
				),
		},
	})
);

registerDataSource("db", "setHeroCallsheets", {
	formFields: {
		date: "date",
		project: {
			type: "choice",
			choices: () =>
				window.dataSources.setHeroProjects.get().then((res) =>
					!res
						? null
						: res.map((p) => ({
								...p,
								label: p.title,
								value: p.title,
						  }))
				),
		},
	},
	mapEntry(item) {
		return {
			...item,
			title: window.formatDate(item.date),
			subtitle: item.project,
		};
	},
	layoutProps: {
		layout: "grid",
		aspectRatio: "1/0.8",
		meta: {
			inset: true,
			imagePlaceholder: `<svg class="size-10 opacity-70" viewBox="0 0 24 24" fill="none" stroke-width="1" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
			</svg>`,
		},
	},
	actions: () => [window.actions.addSetHeroCallsheet],
	entryActions: (item) => {
		return [
			{
				label: "Edit Callsheet",
				handler: () =>
					window.actions.editSetHeroCallsheet.handler(item),
			},
			{
				label: "Delete Callsheet",
				destructive: true,
				handler: async () => {
					const confirmed = await window.confirmDangerousAction();

					if (!confirmed) return;

					window.withLoader(
						window.dataSources.setHeroCallsheets.deleteRow(
							item._id
						),
						{
							successMessage: "Callsheet deleted",
							errorMessage: "Failed to delete callsheet",
						}
					);
				},
			},
			...(!onDesktop() ? [] : [window.actions.addSetHeroCallsheet]),
		];
	},
});

registerAction("addSetHeroCallsheet", () =>
	window.openAlertForm({
		title: "New Callsheet",
		fields: window.dataSources.setHeroCallsheets.formFields,
		action: {
			label: "Create",
			handler: (callsheet) =>
				window.withLoader(
					window.dataSources.setHeroCallsheets.insertRow(callsheet),
					{
						successMessage: "Callsheet added",
						errorMessage: "Failed to add callsheet",
					}
				),
		},
	})
);

registerAction("editSetHeroCallsheet", (callsheet) =>
	window.openAlertForm({
		title: "Edit Callsheet",
		data: callsheet,
		fields: window.dataSources.setHeroCallsheets.formFields,
		action: {
			label: "Save",
			handler: (callsheet) =>
				window.withLoader(
					window.dataSources.setHeroCallsheets.updateRow(
						callsheet._id,
						callsheet
					),
					{
						successMessage: "Callsheet updated",
						errorMessage: "Failed to update callsheet",
					}
				),
		},
	})
);

export default function SetHero() {
	const { dataSources } = useAppContext();
	return (
		<>
			<Page source={dataSources.setHeroCallsheets} />
			<NavItems />
		</>
	);
}
