import { useEffect, useRef, useState } from "react";
import {
	defaultPierChartOptions,
	schema as pieChartSchema,
} from "./pier-chart";
import { defaultBarChartOptions, schema as barChartSchema } from "./bar-chart";
import useDataSchema from "@/hooks/useDataSchema";
import ComponentFields from "@/components/tokens/ComponentFields";
import { ChartDrawer } from "./ChartDrawer";

export default function ChartComponent({ chartType = "bar" }) {
	const previewRef = useRef(null);
	const chartComponentDrawerRef = useRef((data) => {
		if (!window.chartComponentDrawer)
			window.chartComponentDrawer = new ChartDrawer();

		window.chartComponentDrawer.draw(data).then(setUrl);
	});
	const [url, setUrl] = useState();
	const [schema, setSchema] = useState(
		{ pie: pieChartSchema, bar: barChartSchema }[chartType]
	);
	const [data, updateField, setData] = useDataSchema(
		{
			pie: { chart: "pie", ...defaultPierChartOptions },
			bar: { chart: "bar", ...defaultBarChartOptions },
		}[chartType],
		chartComponentDrawerRef.current
	);

	const handleUpdateField = (field, value) => {
		if (field == "chart") {
			setUrl("");
			const chartData = {
				pie: defaultPierChartOptions,
				bar: defaultBarChartOptions,
			}[value];
			const chartSchema = {
				pie: pieChartSchema,
				bar: barChartSchema,
			}[value];

			setData({
				chart: value,
				...(chartData ? chartData : {}),
			});
			setSchema({
				...(chartSchema ? chartSchema : {}),
			});

			return;
		}

		if (field == "colors") value = Object.values(value);

		updateField(field, value);
	};

	useEffect(() => {
		chartComponentDrawerRef.current(data);
	}, []);

	const exportImage = async (e) => {
		const fromDrag = e?.target?.nodeName != "IMG";
		const blob = await fetch(previewRef.current.src).then((response) =>
			response.blob()
		);

		if (fromDrag) return [{ blob }];
		else window.AddOnSdk?.app.document.addImage(blob);
	};

	return (
		<>
			<div
				className="relative relative border-b flex center-center p-3"
				// style={{ display: !url ? "none" : "" }}
			>
				<div className="image-item relative" draggable="true">
					<img
						onClick={exportImage}
						ref={previewRef}
						className="drag-target max-w-full"
						src={url}
						style={{ minHeight: "20vh", maxHeight: "20vh" }}
					/>
				</div>
			</div>

			<div className="px-12px mt-1">
				<ComponentFields
					key={data.chart}
					schema={{
						chart: {
							type: "tag",
							label: "",
							choices: ["pie", "bar"].map((value) => ({
								value,
								label: value + " Chart",
							})),
						},
						...schema,
					}}
					onChange={handleUpdateField}
					data={data}
				/>
			</div>
		</>
	);
}
