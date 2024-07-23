import { useState, useRef } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import {
	objectFieldChoices,
	useEventListener,
	isValidAction,
	onActionClick,
} from "@/crotchet";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import SpotlightListItem from "../SpotlightComponents/SpotlightListItem";
import SpotlightGrid from "../SpotlightComponents/SpotlightGrid";
import { sectionedChoices } from "../../../utils";
import clsx from "clsx";

const layoutDetails = (page) => {
	const {
		layout,
		columns: columnString = 3,
		aspectRatio = "1/1",
	} = {
		...(page?.layoutProps || {}),
	};
	const columnMap = columnString
		.toString()
		.split(",")
		.reduce(
			(agg, col) => {
				const [columns, screen = "xs"] = col.split(":").reverse();

				return {
					...agg,
					[screen]: Number(columns),
				};
			},
			{ xs: 1 }
		);

	const columns =
		columnMap["2xl"] ||
		columnMap["xl"] ||
		columnMap["lg"] ||
		columnMap["md"] ||
		columnMap["sm"] ||
		columnMap["xs"];

	const grid = ["grid", "masonry"].includes(layout);

	return {
		grid,
		aspectRatio,
		columns,
	};
};

export default function SearchPage() {
	const {
		page,
		pageData,
		setMainAction,
		setActions,
		onClose,
		onPop,
		onPopAll,
		onOpen,
		onReady,
		onEscape,
		onNavigateDown,
		onNavigateUp,
	} = useSpotlightPageContext();
	const [activeChoice, _setActiveChoice] = useState();
	const [query, setQuery] = useState("");
	const containerRef = useRef(null);
	const inputRef = useRef(null);
	const { grid, aspectRatio, columns } = layoutDetails(page);
	const choices = pageData || [];

	const getContainer = () => containerRef.current;

	const getActionForValue = (value) => {
		const choice = objectFieldChoices(choices).find(
			(choice) => choice.value == value
		);
		let action, actions;

		if (choice) {
			action = choice.action
				? choice.action
				: typeof page.entryAction == "function"
				? page.entryAction(choice)
				: isValidAction(choice)
				? { ...choice, label: "Select" }
				: null;

			actions = choice.actions
				? choice.actions
				: typeof page.entryActions == "function"
				? page.entryActions(choice)
				: null;
		}

		return [action, actions];
	};

	const handleSelect = (value) => {
		const [action] = getActionForValue(value);
		onActionClick(action)();
		navigate(value);
	};

	const setActiveChoice = (value) => {
		_setActiveChoice(value);

		const [action, actions] = getActionForValue(value);
		setMainAction(action);
		setActions(actions);
	};

	useEventListener("click", () => {
		if (inputRef.current) inputRef.current.focus();
	});

	const focusInput = () => {
		if (inputRef.current) inputRef.current.select();
	};

	const navigateToStart = (focus) => {
		setTimeout(() => navigate());
		if (focus) focusInput();
	};

	const navigate = (value) => {
		const options = getContainer().querySelectorAll(
			"[data-reach-combobox-option]"
		);
		const activeChoice = getContainer()
			.querySelector("[data-reach-combobox-option][data-selected]")
			?.getAttribute("data-value");

		if (!options?.length) return setActiveChoice(null);

		const values = Array.from(options).map((option) =>
			option.getAttribute("data-value")
		);

		if (!value) value = values[0];
		else if (["up", "down"].includes(value)) {
			let index = values.findIndex((value) => value === activeChoice);

			if (index == -1) index = 0;
			else if (value == "down")
				index = index == options.length - 1 ? 0 : index + 1;
			else if (value == "up")
				index = index == 0 ? options.length - 1 : (index = index - 1);

			value = values[index];
		}

		setActiveChoice(value);

		if (value == values[0])
			getContainer().querySelector("#scrollArea").scrollTop = 0;
		else options[values.indexOf(value)]?.scrollIntoView();
	};

	const handleEscape = ({ popAll } = {}) => {
		if (!open) return;

		if (query.length) {
			setQuery("");
			navigateToStart();

			if (popAll && typeof onPopAll == "function") onPopAll();

			return;
		}

		if (popAll && typeof onPopAll == "function") return onPopAll();

		if (typeof onPop == "function") return onPop();

		onClose();
	};

	onOpen(() => {
		if (!activeChoice) navigateToStart("select");
		else focusInput();
	});

	onReady(() => navigateToStart());

	onNavigateDown(() => navigate("down"));

	onNavigateUp(() => navigate("up"));

	onEscape((payload) => handleEscape(payload));

	const choiceSections = sectionedChoices(choices, query);

	return (
		<div ref={containerRef}>
			<div className="h-14 px-4 flex items-center comboboxData.isExpanded border-b border-content/10 z-10 relative">
				{typeof onPop == "function" && (
					<button
						type="button"
						className="flex-shrink-0 -ml-1.5 mr-2.5 bg-content/10 rounded flex items-center justify-center w-7 h-7"
						onClick={onPop}
					>
						<ArrowLeftIcon width={13} strokeWidth={3} />
					</button>
				)}

				<input
					type="text"
					ref={inputRef}
					className="popover-input bg-transparent h-full w-full border-none shadow-none px-0 py-3 text-xl focus:outline-none placeholder-content/30"
					placeholder={page?.placeholder || "Type to search actions"}
					// onKeyDown={onKeyDown}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						navigateToStart();
					}}
				/>

				{/* <SpotlightPageActions page={page} /> */}
			</div>

			<div
				id="scrollArea"
				className="relative overflow-auto"
				style={{ height: "calc(100vh - 100px)" }}
			>
				{!choiceSections?.length && (
					<div className="rounded relative cursor-default select-none py-2 truncate text-[14px] text-content/30 text-center font-medium">
						No results
					</div>
				)}

				{choiceSections.map(([section, choices], idx) => {
					if (grid) {
						return (
							<SpotlightGrid
								key={section + "" + idx}
								aspectRatio={aspectRatio}
								columns={columns}
								choices={choices}
								selected={activeChoice}
								onSelect={handleSelect}
							/>
						);
					}

					return (
						<div
							key={section + "" + idx}
							className={clsx({
								"border-b border-content/5":
									idx != choiceSections.length - 1,
							})}
						>
							{section && (
								<span className="mt-5 mb-1 uppercase tracking-wide text-xs font-semibold opacity-50 px-4 flex items-center">
									{section}
								</span>
							)}

							{choices.map((choice) => {
								return (
									<SpotlightListItem
										key={choice.__id}
										className="cursor-default"
										label={choice.label}
										value={choice.value}
										focused={activeChoice == choice.value}
										onClick={() =>
											handleSelect(choice.value)
										}
									/>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
}
