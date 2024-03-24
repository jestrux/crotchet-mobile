import BottomNavAction from "@/components/BottomNavAction";
import { copyToClipboard, shuffle, useEffect, useRef, useState } from "..";
import ColorThief from "colorthief";
import clsx from "clsx";

const rgbToHex = (r, g, b) =>
	"#" +
	[r, g, b]
		.map((x) => {
			const hex = x.toString(16);
			return hex.length === 1 ? "0" + hex : hex;
		})
		.join("");

export default function UseImage({ image }) {
	const imageRef = useRef(null);
	const [{ loading, data }, setData] = useState({
		loading: true,
		data: null,
	});

	const setColors = () => {
		const img = imageRef.current;
		if (!img?.complete) return;

		try {
			setTimeout(() => {
				const colorThief = new ColorThief(img);

				setData({
					loading: false,
					data: [
						colorThief.getColor(img),
						colorThief.getPalette(img),
					],
				});
			}, 200);
		} catch (error) {
			//
		}
	};

	const getColors = (loading, data) => {
		if (loading || !data)
			return [[240, 240, 240], Array(10).fill([240, 240, 240])];

		return data;
	};

	useEffect(() => {
		setTimeout(() => {
			if (!data) setColors();
		}, 20);
	}, []);

	let [color, palette] = getColors(loading, data);

	color = rgbToHex(...color);
	palette = palette.map((color) => rgbToHex(...color));

	const gradient = (colors) =>
		colors
			.map((color, idx) => {
				return `${color} ${(idx * 100) / (colors.length - 1)}%`;
			})
			.join(", ");
	const gradient1String = `linear-gradient(90deg, ${gradient(
		palette.slice(0, 3)
	)})`;
	const gradient2String = `linear-gradient(90deg, ${gradient(
		shuffle(shuffle(palette)).slice(0, 3)
	)})`;

	return (
		<div key={data + loading} className="flex flex-col gap-3">
			<div className="aspect-video relative bg-content/5 border-4 border-content/10 rounded-md overflow-hidden">
				<img
					ref={imageRef}
					className="absolute inset-0 size-full object-cover rounded"
					src={image}
					crossOrigin="anonymous"
					onLoad={setColors}
				/>
			</div>

			<div className="mt-4 space-y-3">
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
										background: !data
											? ""
											: gradient1String,
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
										background: !data
											? ""
											: gradient2String,
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
				</div>
			</div>
		</div>
	);
}
