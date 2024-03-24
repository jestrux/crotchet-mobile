import React from "react";
import ButtonGroup from "./ButtonGroup";
import ColorList from "./ColorList";
import TagList from "./TagList";
import Toggle from "./Toggle";
import ImagePicker from "./ImagePicker";
import ColorSwatch from "./ColorSwatch";
import GridList from "./GridList";
import SliderInput from "./SliderInput";
import CardList from "./CardList";
import InfoCard from "./InfoCard";
import { camelCaseToSentenceCase } from "@/utils";

const ComponentFieldEditor = function ({ inset, field = {}, onChange }) {
	const {
		__id,
		__data,
		optional,
		label,
		hint: hintProp,
		type,
		choices,
		defaultValue,
		offValue,
		min,
		max,
		value,
		inline,
		meta = {},
		wrapperProps = {},
	} = {
		...(field ? field : {}),
	};
	const { text: hint, type: hintType } = !hintProp
		? { text: null }
		: typeof hintProp == "object"
		? hintProp
		: { text: hintProp };

	function handleToggle(newValue) {
		const fieldTypeIsText =
			!type || !type.length || type.toLowerCase() == "text";
		const derivedOffValue = offValue || fieldTypeIsText ? "" : null;

		handleChange(!newValue ? derivedOffValue : defaultValue || true);
	}

	function handleChange(newValue) {
		if (min != undefined) {
			let minValue = min;
			if (typeof min == "function") minValue = min(__data);
			if (newValue < minValue) newValue = minValue;
		}
		if (max != undefined) {
			let maxValue = max;
			if (typeof max == "function") maxValue = max(__data);
			if (newValue > maxValue) newValue = maxValue;
		}

		onChange(__id, newValue);
	}

	const isCustomFieldType = [
		"boolean",
		"color",
		"background",
		"swatch",
		"gradient",
		"icon",
		"radio",
		"tag",
		"card",
		"grid",
		"image",
		"logo",
		"range",
	].includes(type);

	let { className: wrapperClassName, ...otherWrapperProps } = wrapperProps;
	let { className, ...otherMeta } = meta;
	let initialValue = value;

	if (type == "date") {
		try {
			initialValue = new Intl.DateTimeFormat("en-UK")
				.format(value)
				.split("/")
				.reverse()
				.map((entry) => entry.padStart(2, "0"))
				.join("-");
		} catch (error) {
			//
		}
	}

	return (
		<div
			className={`ComponentFieldEditor mt-2 ${wrapperClassName} ${
				inline && "flex items-center justify-between"
			}`}
			{...otherWrapperProps}
		>
			{hint && hint.length && (
				<div
					className="-mx-12px mb-2"
					style={{ marginTop: "-0.75rem" }}
				>
					<InfoCard infoIcon={hintType == "info"}>{hint}</InfoCard>
				</div>
			)}

			{label && label.length && (
				<div
					className="flex items-center justify-between"
					style={{
						marginBottom:
							isCustomFieldType &&
							!inline &&
							type != "boolean" &&
							(!optional || value)
								? "0.4rem"
								: 0,
					}}
				>
					<label
						className={`fieldEditorLabel ${inset && "inset"}`}
						style={{
							paddingTop: inline ? "2px" : "",
						}}
					>
						{camelCaseToSentenceCase(label)}
					</label>

					{type == "boolean" && (
						<Toggle checked={value} onChange={handleChange} />
					)}
					{optional == true && (
						<Toggle checked={value} onChange={handleToggle} />
					)}
				</div>
			)}

			{(!optional || value) && (
				<React.Fragment>
					{type == "grid" && (
						<GridList
							value={value}
							choices={choices}
							onChange={handleChange}
							{...meta}
						/>
					)}

					{type == "card" && (
						<CardList
							value={value}
							choices={choices}
							onChange={handleChange}
							{...meta}
						/>
					)}

					{type == "tag" && (
						<TagList
							value={value}
							choices={choices}
							onChange={handleChange}
							{...meta}
						/>
					)}

					{type == "radio" && (
						<ButtonGroup
							value={value}
							choices={choices}
							onChange={handleChange}
							{...meta}
						/>
					)}

					{type == "color" && (
						<ColorList
							colors={choices}
							selectedColor={value}
							onChange={handleChange}
							{...meta}
						/>
					)}

					{type == "swatch" && (
						<div className="mt-1">
							<ColorSwatch
								value={value}
								onChange={handleChange}
								{...meta}
							/>
						</div>
					)}

					{type == "image" && (
						<div className="mt-1">
							<ImagePicker onChange={handleChange} {...meta} />
						</div>
					)}

					{type == "range" && (
						<div style={{ margin: "-0.25rem 0" }}>
							<SliderInput
								label={label}
								value={value}
								onChange={handleChange}
								{...meta}
							/>
						</div>
					)}

					{!isCustomFieldType && (
						// <form
						// 	className="w-full"
						// 	onSubmit={(e) => {
						// 		e.preventDefault();
						// 		handleChange(
						// 			type == "number"
						// 				? Number(tempValue)
						// 				: tempValue
						// 		);
						// 	}}
						// >

						<input
							className={`m-0 w-full ${
								type == "range"
									? "mt-1"
									: "py-2 px-2 border border-dark-gray rounded-xs"
							} ${className}`}
							type={type}
							// value={tempValue}
							defaultValue={initialValue}
							{...otherMeta}
							// onChange={(e) => setTempValue(e.target.value)}
							onChange={(e) => handleChange(e.target.value)}
						/>
						// </form>
					)}
				</React.Fragment>
			)}
		</div>
	);
};

export default ComponentFieldEditor;
