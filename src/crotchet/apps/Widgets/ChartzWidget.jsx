import { useEffect, useRef, useState } from "react";
import Widget from "@/components/Widget";
import clsx from "clsx";
import {
	defaultPierChartOptions,
	randomPierChartOptions,
} from "../Chartz/pier-chart";
import {
	defaultBarChartOptions,
	randomBarChartOptions,
} from "../Chartz/bar-chart";
import { ChartDrawer } from "../Chartz/ChartDrawer";
import { Loader, useAppContext, usePrefsState } from "@/crotchet";
import ChartComponent from "../Chartz";

export default function ChartzWidget() {
	const { openBottomSheet } = useAppContext();
	const chartzDrawerRef = useRef((data) => {
		if (!window.chartzDrawer) window.chartzDrawer = new ChartDrawer();

		window.chartzDrawer.draw(data).then(setUrl);
	});
	const [url, setUrl] = useState();
	const getChartDetails = (chart, random) => {
		const props = {
			bar: random ? randomBarChartOptions() : defaultBarChartOptions,
			pie: random ? randomPierChartOptions() : defaultPierChartOptions,
		}[chart];

		if (!props) return null;

		return {
			chart,
			...props,
		};
	};
	const [chartType, setChartType, loadingChartType] = usePrefsState(
		"chartz://widget/chartType",
		"bar"
	);
	const [, setData] = useState(getChartDetails(chartType));

	useEffect(() => {
		if (!loadingChartType && !url) {
			chartzDrawerRef.current(getChartDetails(chartType));
		}
	}, [loadingChartType, chartType]);

	const actions = [
		{
			icon: "shuffle",
			onClick: () => {
				setData(() => {
					const newValue = getChartDetails(chartType, true);
					chartzDrawerRef.current(newValue);
					return newValue;
				});
			},
		},
	];

	const handleSetChartType = (type) => {
		setChartType(type);

		setData(() => {
			const newValue = getChartDetails(type);
			chartzDrawerRef.current(newValue);
			return newValue;
		});

		document
			.querySelector("#chartzWidgetContent")
			.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<Widget
			title="Chartz"
			actions={actions}
			onClick={() =>
				openBottomSheet({
					fullHeight: true,
					noScroll: true,
					content: <ChartComponent chartType={chartType} />,
				})
			}
		>
			<div
				id="chartzWidgetContent"
				className="h-full flex flex-col relative"
			>
				{(loadingChartType || !url) && <Loader fillParent />}

				{!loadingChartType && url && (
					<>
						<div
							className={clsx(
								"flex-1 w-full relative flex items-end justify-center overflow-hidden"
								// "flex-1 px-3 bg-content/5 w-full rounded-md overflow-hidden relative flex items-end justify-center",
								// data?.chart == "pie" ? "py-2" : "pt-1"
							)}
						>
							<img
								className={clsx(
									"object-contain object-top",
									chartType == "bar"
										? "w-full -mb-1"
										: "h-full"
								)}
								src={url}
							/>
						</div>

						<div className="pt-2">
							{/* <span className="text-lg font-bold">Chartz</span> */}

							<div className="mt-0.5 grid grid-cols-2 gap-2">
								{/* {["Pie", "Column", "Bar", "Line"].map((type) => { */}
								{["bar", "pie"].map((type) => {
									return (
										<button
											key={type}
											className={clsx(
												"capitalize border border-content/20 text-xs/none font-bold relative h-8 px-3 rounded-full",
												{
													"text-canvas bg-content/60":
														type == chartType,
												}
											)}
											onClick={(e) => {
												e.stopPropagation();
												handleSetChartType(type);
											}}
										>
											{type}
										</button>
									);
								})}
							</div>
						</div>
					</>
				)}
			</div>
		</Widget>
	);
}
