import { useEffect, useRef, useState } from "react";
import ComponentFieldEditor from "./ComponentFieldEditor";
import Toggle from "./Toggle";
import KeyValueEditor from "./KeyValueEditor";
import { camelCaseToSentenceCase } from "@/utils";

function schemaToFields(schema, data) {
	const fields = [];

	Object.entries(schema).forEach(([label, props]) => {
		if (typeof props == "string") props = { type: props };

		props.__id = label;
		props.label = ["undefined", null].includes(typeof props.label)
			? label
			: props.label;

		// if(data) props.value = data;
		props.value = data ? data[label] : props.defaultValue;

		if (!props.group && !props.sectionedGroup) fields.push(props);
		else {
			const groupIndex = fields.findIndex((group) =>
				[props.group, props.sectionedGroup].includes(group.label)
			);

			if (groupIndex != -1) fields[groupIndex].children.push(props);
			else {
				const group = {
					type: "group",
					label: props.group || props.sectionedGroup,
					section: props.sectionedGroup,
					optional: props.optional == "group",
					children: [props],
				};

				fields.push(group);
			}
		}
	});

	return fields;
}

function ComponentFieldSection({
	field,
	data,
	isLast = false,
	rootLevel = false,
	onChange,
}) {
	const collapsedRef = useRef();
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		if (field.collapsible === false) return;

		if (collapsedRef?.current == null) {
			const initialCollapsed = field.collapsed || false;
			collapsedRef.current = initialCollapsed;
			setCollapsed(initialCollapsed);
		}
	}, []);

	function handleChange(key, newValue) {
		const updatedProps = typeof key == "string" ? { [key]: newValue } : key;

		onChange(field.__id, {
			...data,
			...updatedProps,
		});
	}

	function handleToggle(newValue) {
		const newProps = !newValue
			? null
			: schemaToFields(field.children, data).reduce((agg, child) => {
					return {
						...agg,
						[child.__id]: child.optional
							? child.offValue || false
							: child.defaultValue == undefined
							? true
							: child.defaultValue,
					};
			  }, {});

		onChange({
			...data,
			[field.__id]: newProps,
		});
	}

	const children = !data ? [] : schemaToFields(field.children, data);
	const fieldDisabled = field.optional && !data;

	return (
		<div
			className={`SectionField -mx-12px ${
				data &&
				((rootLevel && !field.noBorder) || !isLast) &&
				"border-b "
			} 
				${!data && rootLevel && !field.noBorder && "border-b"}
			`}
			style={{
				marginBottom: rootLevel
					? field.noMargin
						? "-1rem"
						: "-0.75rem"
					: "",
			}}
		>
			<div className="relative">
				{data && !collapsed && (
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
						{rootLevel && field.collapsible != false && (
							<button
								className="hoverable rounded-xs border flex center-center"
								onClick={() =>
									fieldDisabled
										? null
										: setCollapsed(!collapsed)
								}
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
						)}

						<label className="fieldEditorLabel">
							{camelCaseToSentenceCase(field.label)}
						</label>
					</div>

					{field.optional && (
						<Toggle checked={data} onChange={handleToggle} />
					)}
				</div>
			</div>

			<div className={` overflow-hidden ${collapsed ? "mt-1" : "mt-2"}`}>
				{!collapsed && data && (
					<div className={`${rootLevel ? "px-12px" : ""}`}>
						<div className={rootLevel ? "" : "px-12px"}>
							{children.map((field, index) => {
								if (
									typeof field.show == "function" &&
									!field.show(data)
								) {
									return null;
								}

								if (field.type == "section")
									return (
										<ComponentFieldSection
											key={index}
											isLast={
												index == children.length - 1
											}
											field={field}
											data={data[field.__id]}
											onChange={handleChange}
										/>
									);
								else if (field.type == "group")
									return (
										<ComponentFieldGroup
											key={index}
											field={field}
											data={data}
											onChange={handleChange}
										/>
									);

								return (
									<div
										className={
											!field.noMargin ? "mb-4" : ""
										}
										key={index}
									>
										<ComponentFieldEditor
											inset
											field={{
												...field,
												__data: data,
											}}
											onChange={handleChange}
										/>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function ComponentFieldGroup({ field, data, onChange }) {
	function handleToggle(newValue) {
		const newProps = field.children.reduce((agg, child) => {
			const childTypeIsText =
				!child.type ||
				!child.type.length ||
				child.type.toLowerCase() == "text";
			const offValue = child.offValue || childTypeIsText ? "" : null;

			return {
				...agg,
				[child.__id]: !newValue
					? offValue
					: child.defaultValue == undefined
					? true
					: child.defaultValue,
			};
		}, {});
		onChange(newProps);
	}

	const checked = field.children.some((child) => child.value);
	let label = camelCaseToSentenceCase(field.label);
	if (field.section) label = label.toUpperCase();

	return (
		<div
			className={`${
				field.section
					? "mb-3s border-t sborder-b-2 -mx-12px px-12px pb-1"
					: "mb-2"
			}`}
		>
			<div className="mt-2 flex items-center justify-between">
				<label
					className={`${
						field.section
							? "text-sm tracking-widest text-blue"
							: "text-md"
					}`}
				>
					{label}
				</label>

				{field.optional && (
					<Toggle checked={checked} onChange={handleToggle} />
				)}
			</div>

			{checked &&
				field.children.map((child, index) => (
					<div className="mb-1" key={index}>
						<ComponentFieldEditor
							field={{ ...child, __data: data }}
							onChange={onChange}
						/>
					</div>
				))}
		</div>
	);
}

function ComponentFields({ schema, data, onChange }) {
	const fields = schemaToFields(schema, data);

	return (
		<div className="flex flex-col gap-5">
			{fields.map((field, index) => {
				if (typeof field.show == "function" && !field.show(data)) {
					return null;
				}

				if (field.type == "section")
					return (
						<ComponentFieldSection
							key={index}
							rootLevel
							field={field}
							data={data[field.__id]}
							onChange={onChange}
						/>
					);
				else if (field.type == "group")
					return (
						<ComponentFieldGroup
							key={index}
							field={field}
							data={data}
							onChange={onChange}
						/>
					);
				else if (field.type == "keyValue")
					return (
						<KeyValueEditor
							key={index}
							field={field}
							data={data}
							onChange={onChange}
						/>
					);

				return (
					<div
						key={index}
						className="relative"
						style={{
							marginBottom: field.noMargin ? "-1.05rem" : "",
						}}
					>
						<ComponentFieldEditor
							field={{ ...field, __data: data }}
							onChange={onChange}
						/>

						{!field.noBorder && (
							<div
								className="border-b absolute"
								style={{
									top: "auto",
									left: "-12px",
									right: "-12px",
									// left: "0px",
									// right: "0px",
									bottom: "-1rem",
									opacity: 1,
								}}
							></div>
						)}
					</div>
				);
			})}
		</div>
	);
}

export default ComponentFields;
