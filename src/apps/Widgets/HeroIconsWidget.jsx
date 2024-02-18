import { dataSource } from "@/providers/data";
import DataWidget from "../../components/DataWidget";
import { useAppContext } from "@/providers/app";

export default function HeroIconsWidget() {
	const { openSearchPage } = useAppContext();
	const source = dataSource.crotchet("heroicons");

	return (
		<DataWidget
			source={source}
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
						onClick() {
							openSearchPage({
								title: "Search Heroicons",
								source,
							});
						},
					},
				],
			}}
		/>
	);
}
