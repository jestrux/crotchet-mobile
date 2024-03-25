import BottomNavAction from "@/components/BottomNavAction";
import { copyToClipboard, shuffle } from "..";
import { average, prominent } from "color.js";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";

export default function UseImage({ image }) {
	const { isLoading: loading, data } = useQuery({
		queryKey: [image],
		queryFn: () =>
			Promise.all([
				average(image, { format: "hex" }),
				prominent(image, { amount: 10, format: "hex" }),
			]),
	});

	const getColors = (loading, data) => {
		if (loading || !data?.length)
			return ["#f0f0f0", Array(10).fill("#f0f0f0")];

		let [color = "#f0f0f0", palette = []] = data;

		if (!Array.isArray(palette)) palette = [];

		return [color, palette];
	};

	let [color, palette] = getColors(loading, data);

	console.log(color, palette);

	const gradient = (colors) => {
		if (typeof colors?.map != "function") return "red";

		return colors
			.map((color, idx) => {
				return `${color} ${(idx * 100) / (colors.length - 1)}%`;
			})
			.join(", ");
	};
	const gradient1String = `linear-gradient(90deg, ${gradient(
		palette.slice(0, 3)
	)})`;
	const gradient2String = `linear-gradient(90deg, ${gradient(
		shuffle(shuffle(palette)).slice(0, 3)
	)})`;

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-3 gap-3">
				<BottomNavAction
					vertical
					className="bg-card shadow dark:border border-content/5 p-4 rounded-lg"
					action={{
						icon: (
							<span
								className={clsx(
									"-ml-1.5 block w-8 aspect-square rounded-full bg-content/5",
									!data ? "animate-pulse" : ""
								)}
								style={{ background: !data ? "" : color }}
							></span>
						),
						label: "Main Color",
						url: `crotchet://copy/${color}`,
					}}
					inShareSheet
				/>
				<BottomNavAction
					vertical
					className="bg-card shadow dark:border border-content/5 p-4 rounded-lg"
					action={{
						icon: (
							<span
								className={clsx(
									"-ml-1.5 block w-8 aspect-square rounded-full bg-content/5",
									!data ? "animate-pulse" : ""
								)}
								style={{
									background: !data ? "" : gradient1String,
								}}
							></span>
						),
						label: "Gradient 1",
						url: `crotchet://copy/${gradient1String}`,
					}}
					inShareSheet
				/>
				<BottomNavAction
					vertical
					className="bg-card shadow dark:border border-content/5 p-4 rounded-lg"
					action={{
						icon: (
							<span
								className={clsx(
									"-ml-1.5 block w-8 aspect-square rounded-full bg-content/5",
									!data ? "animate-pulse" : ""
								)}
								style={{
									background: !data ? "" : gradient2String,
								}}
							></span>
						),
						label: "Gradient 2",
						url: `crotchet://copy/${gradient2String}`,
					}}
					inShareSheet
				/>
			</div>

			<div className="mb-2 bg-card shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5">
				<BottomNavAction
					key={color}
					className="px-4"
					action={{
						label: "Color palette",
					}}
					inShareSheet
				/>

				{typeof palette?.map == "function" ? (
					<div className="grid grid-cols-7 gap-3 p-4">
						{palette.map((color, index) => (
							<div
								key={color + index}
								className={clsx(
									"block w-full aspect-square rounded-full bg-content/5",
									!data ? "animate-pulse" : ""
								)}
								style={{ background: !data ? "" : color }}
								onClick={() => copyToClipboard(color)}
							></div>
						))}
					</div>
				) : (
					<div className="p-4 w-full">{JSON.stringify(palette)}</div>
				)}
			</div>
		</div>
	);
}
