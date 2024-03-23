import { useEffect, useRef, useState } from "react";
import Widget from "@/components/Widget";
import clsx from "clsx";
import { defaultOptions as pieChartDefaultOptions } from "../Chartz/pier-chart";
import { defaultOptions as barChartDefaultOptions } from "../Chartz/bar-chart";
import { chartThemes, dataSets } from "../Chartz/chart-utils";
import { shuffle } from "@/utils";
import { ChartDrawer } from "../Chartz/ChartDrawer";

export default function ChartzWidget() {
	const [chartType, setChartType] = useState("Bar");
	const chartzDrawerRef = useRef((data) => {
		if (!window.chartzDrawer) window.chartzDrawer = new ChartDrawer();

		window.chartzDrawer.draw(data).then(setUrl);
	});
	const [url, setUrl] = useState();
	const [data, setData] = useState({
		chart: "bar",
		...barChartDefaultOptions,
	});

	useEffect(() => {
		chartzDrawerRef.current(data);
	}, []);

	const actions = [
		{
			icon: "shuffle",
			onClick: () => {
				setData((dt) => {
					const newValue = {
						...dt,
						data: shuffle(shuffle(dataSets))[0],
						colors: shuffle(shuffle(chartThemes))[0],
					};

					chartzDrawerRef.current(newValue);

					return newValue;
				});
			},
		},
	];

	const handleSetChartType = (type) => {
		setChartType(type);
		const bar = type.toLowerCase() == "bar";

		setData(() => {
			const newValue = {
				chart: bar ? "bar" : "pie",
				...(bar
					? {
							...barChartDefaultOptions,
							settings: {
								barCorners: 20,
								gridSpacing: "normal",
								barSpacing: 20,
								labels: 25, // 25
								borders: 2.5,
							},
					  }
					: {
							...pieChartDefaultOptions,
							settings: {
								fontFamily: "Georgia, serif",
								fontSize: 50,
								categoryLabel: false, // true,
								categoryAmount: "%",
								doughnutHoleSize: 0.35, // 0.7,
								borders: 6,
							},
					  }),
				data: shuffle(shuffle(dataSets))[0],
				colors: shuffle(shuffle(chartThemes))[0],
			};

			chartzDrawerRef.current(newValue);

			return newValue;
		});

		document
			.querySelector("#chartzWidgetContent")
			.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<Widget titles="Chartz" actions={actions} snoPadding>
			<div id="chartzWidgetContent" className="h-full flex flex-col">
				<div
					className={clsx(
						"flex-1 px-3 bg-content/5 w-full rounded-md overflow-hidden relative flex items-end justify-center",
						data?.chart == "pie" ? "py-2" : "pt-1"
					)}
				>
					<img
						className={clsx(
							"object-contain object-top",
							data?.chart == "bar" ? "w-full -mb-1" : "h-full"
						)}
						src={url}
					/>
				</div>

				<div className="pt-2">
					{/* <span className="text-lg font-bold">Chartz</span> */}

					<div className="mt-0.5 grid grid-cols-2 gap-2">
						{/* {["Pie", "Column", "Bar", "Line"].map((type) => { */}
						{["Bar", "Pie"].map((type) => {
							return (
								<button
									key={type}
									className={clsx(
										"border border-content/20 text-xs/none font-bold relative h-8 px-3 rounded-full",
										{
											"text-canvas bg-content/60":
												type == chartType,
										}
									)}
									onClick={() => handleSetChartType(type)}
								>
									{type}
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</Widget>
	);
}
