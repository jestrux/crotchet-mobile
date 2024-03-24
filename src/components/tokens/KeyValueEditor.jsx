import { useEffect, useRef, useState } from "react";
import Toggle from "./Toggle";
import { camelCaseToSentenceCase, objectExcept, shuffle } from "@/utils";

const Editor = ({ meta, dataSet, onChangeEntry }) => {
	const entries = Object.entries(dataSet || {});

	return (
		<div className="mt-4 mb-3 border rounded overflow-hidden">
			{entries.map(([key, val], index) => {
				return (
					<div
						key={index}
						className={`gap-2 ${
							index < entries.length - 1 && "border-b"
						}`}
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1px 1fr",
						}}
					>
						<div className="">
							<input
								className="w-full py-2 px-3"
								style={{
									textAlign: "left",
									outline: "none",
									border: "none",
									background: "transparent",
								}}
								defaultValue={key}
								onBlur={(e) =>
									onChangeEntry([e.target.value, val], index)
								}
								onKeyUp={(e) =>
									e.key == "Enter" ? e.target.blur() : null
								}
							/>
						</div>

						<div className="bg-gray"></div>

						<div className="">
							<input
								{...meta}
								className="w-full p-2"
								style={{
									textAlign: "left",
									outline: "none",
									border: "none",
									background: "transparent",
								}}
								defaultValue={val}
								onBlur={(e) =>
									onChangeEntry([key, e.target.value], index)
								}
								onKeyUp={(e) =>
									e.key == "Enter" ? e.target.blur() : null
								}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default function KeyValueEditor({ field = {}, onChange }) {
	let { dataSets, ...meta } = objectExcept(field?.meta || {}, ["className"]);
	const collapsedRef = useRef();
	const [dataSet, setDataSet] = useState(field?.value);
	const [collapsed, setCollapsed] = useState(false);

	const valueKeys = Object.keys(dataSet || {});
	dataSets = (dataSets || []).filter((set) => {
		return !Object.keys(set).every((entry) => valueKeys.includes(entry));
	});

	function handleToggle(newValue) {
		onChange(
			field.__id,
			!newValue
				? null
				: field.defaultValue || { field1: "value 1", field2: "value 2" }
		);
	}

	useEffect(() => {
		if (collapsedRef?.current == null) {
			const initialCollapsed = field.collapsed || false;
			collapsedRef.current = initialCollapsed;
			setCollapsed(initialCollapsed);
		}
	}, []);

	const onChangeEntry = ([newKey, newValue], updatedIndex) => {
		onChange(
			field.__id,
			entries.reduce((agg, [key, value], index) => {
				return {
					...agg,
					...(index == updatedIndex
						? { [newKey]: newValue }
						: { [key]: value }),
				};
			}, {})
		);
	};

	const fieldDisabled = field.optional && !dataSet;
	const entries = Object.entries(dataSet || {});

	return (
		<div
			className="SectionField border-b -mx-12px"
			style={{
				marginBottom: "-0.75rem",
			}}
		>
			<div className="relative">
				{dataSet && !collapsed && (
					<div
						className="absolute inset-0"
						style={{
							background: "#E6E6E6",
							top: "-0.25rem",
							bottom: "-0.25rem",
						}}
					>
						<div className="bg-light-gray w-full h-full"></div>
					</div>
				)}
				<div className="relative flex items-center justify-between px-12px py-2">
					<div className="flex items-center gap-1">
						<button
							className="hoverable rounded-xs border flex center-center"
							onClick={() =>
								fieldDisabled ? null : setCollapsed(!collapsed)
							}
							style={{
								padding: "0px 5px 0px 5px",
								height: "20px",
								outline: "none",
								background: "transparent",
								border: "none",
								marginLeft: "-0.4rem",
								opacity: fieldDisabled ? 0.5 : 1,
								pointerEvents: fieldDisabled ? "none" : "auto",
							}}
						>
							<svg
								className="text-primary"
								width={14}
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={3}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d={
										collapsed
											? "M12 4.5v15m7.5-7.5h-15"
											: "M19.5 12h-15"
									}
								/>
							</svg>
						</button>

						<label>{camelCaseToSentenceCase(field.label)}</label>
					</div>

					<div className="flex items-center">
						{dataSets?.length > 0 && (
							<button
								className="hoverable rotate-on-click rounded-xs border flex center-center"
								onClick={() => {
									const newDataSet = shuffle(dataSets)[0];
									onChange(field.__id, newDataSet);
									setDataSet(newDataSet);
								}}
								style={{
									padding: "0px 5px 0px 5px",
									height: "20px",
									outline: "none",
									background: "transparent",
									border: "none",
									marginLeft: "-0.4rem",
									opacity: fieldDisabled ? 0.5 : 1,
									pointerEvents: fieldDisabled
										? "none"
										: "auto",
								}}
							>
								<svg
									className="text-dark-gray"
									width={14}
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={3}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
									/>
								</svg>
							</button>
						)}

						{field.optional && (
							<Toggle checked={dataSet} onChange={handleToggle} />
						)}
					</div>
				</div>
			</div>

			<div className="px-12px pb-1">
				{!collapsed && dataSet && (
					<Editor
						key={Object.keys(dataSet).join(",")}
						meta={meta}
						dataSet={dataSet}
						onChangeEntry={onChangeEntry}
					/>
				)}
			</div>
		</div>
	);
}
