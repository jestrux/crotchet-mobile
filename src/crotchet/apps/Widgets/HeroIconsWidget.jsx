import { registerAction } from "@/crotchet";
import DataWidget from "../../../components/DataWidget";
import { useAppContext } from "@/providers/app";

registerAction("crotchet", "searchHeroicons", {
	handler: ({ openUrl }) =>
		openUrl("crotchet://app/search?source=heroicons&live=true&columns=7"),
	tags: ["svg"],
});

export default function HeroIconsWidget() {
	const { dataSources, onAction } = useAppContext();

	return (
		<DataWidget
			layout="grid"
			columns={8}
			source={dataSources.heroicons}
			widgetProps={{
				icon: (
					<svg
						className="w-3.5"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
					</svg>
				),
				title: "Heroicons",
				actions: [
					{
						icon: "search",
						label: "search",
						onClick: () => onAction("searchHeroicons"),
					},
				],
			}}
		/>
	);
}
