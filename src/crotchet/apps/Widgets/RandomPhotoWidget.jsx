import { Widget, useAppContext } from "@/crotchet";

export default function RandomPhotoWidget() {
	const { dataSources } = useAppContext();

	// return null;

	return (
		<Widget
			noPadding
			actions={[
				{
					icon: "search",
					url: "crotchet://action/searchUnsplash",
				},
			]}
			source={{
				...dataSources.unsplash,
				single: true,
				random: true,
			}}
			// backgroundImage="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Njg3MDF8MHwxfHNlYXJjaHwyfHxiZWFjaHxlbnwwfHx8fDE3MTEwMjA5NjV8MA&ixlib=rb-4.0.3&q=80&w=1080"
			// backgroundImage="gradient"
			// color="white"
			content={({ data }) => ({
				backgroundImage: data?.image,
				url: !data?.image
					? null
					: `crotchet://copy-image/${data.image}`,
				button: {
					label: "Shuffle",
					type: "shuffle",
				},
			})}
		/>
	);
}
