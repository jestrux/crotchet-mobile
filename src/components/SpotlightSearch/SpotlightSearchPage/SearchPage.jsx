import { useState, useRef, Children } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { objectFieldChoices, isValidAction, onActionClick } from "@/crotchet";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import SpotlightListItem from "../SpotlightComponents/SpotlightListItem";
import SpotlightGrid from "../SpotlightComponents/SpotlightGrid";
import { sectionedChoices } from "../../../utils";
import clsx from "clsx";

import SpotlightPageFilters from "./SpotlightPageFilters";

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

export default function SearchPage({ children }) {
	const {
		page,
		pageData,
		pageDataVersion,
		setMainAction,
		setActions,
		preview,
		setPreview,
		onClose,
		fallbackSearchResults,
		onPop,
		onPopAll,
		onOpen,
		onReady,
		onDataUpdated,
		onClick,
		onEscape,
		onNavigateDown,
		onNavigateUp,
	} = useSpotlightPageContext();
	const activeChoiceIndexRef = useRef(null);
	const [activeChoice, _setActiveChoice] = useState();
	const [query, setQuery] = useState("");
	const containerRef = useRef(null);
	const inputRef = useRef(null);
	const { grid, aspectRatio, columns } = layoutDetails(page);
	const choices = pageData || [];
	const choiceSections = sectionedChoices(choices, query);
	const searchResults = choiceSections?.length
		? choiceSections
		: sectionedChoices(
				_.map(fallbackSearchResults(query) || [], (result) => ({
					...result,
					section: `Use "${query}" with`,
				}))
		  );

	const getContainer = () => containerRef.current;

	const getActionForValue = (value) => {
		const searchQuery = inputRef.current.value;
		const results = sectionedChoices(choices, searchQuery)?.length
			? choices
			: _.map(fallbackSearchResults(searchQuery) || [], (result) => ({
					...result,
					section: `Use "${searchQuery}" with`,
			  }));

		const choice = objectFieldChoices(results).find(
			(choice) => choice.value == value
		);
		let action, actions, preview;

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

			preview = choice.preview
				? choice.preview
				: typeof page.entrypreview == "function"
				? page.entryPreview(choice)
				: null;
		}

		return [action, actions, preview];
	};

	const handleSelect = (value) => {
		const [action] = getActionForValue(value);
		onActionClick(action)();
		navigate(value);
	};

	const setActiveChoice = (value, index) => {
		_setActiveChoice(value);

		activeChoiceIndexRef.current = index;

		const [action, actions, preview] = getActionForValue(value);

		setMainAction(action);
		setActions(actions);
		setPreview(preview);
	};

	onClick(() => {
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
		const container = getContainer();
		const scrollArea = container.querySelector("#scrollArea");

		const options = container.querySelectorAll(
			"[data-reach-combobox-option]"
		);
		const activeChoice = container
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

		setActiveChoice(value, values.indexOf(value));

		if (value == values[0]) scrollArea.scrollTop = 0;
		else {
			const el = options[values.indexOf(value)];

			if (!el) return;

			const elementInView = (
				el,
				containerEl,
				{ offsetTop = 6, offsetBottom = 6 } = {}
			) => {
				const rect = el.getBoundingClientRect();
				const parent = containerEl.getBoundingClientRect();
				const top = parent.top + offsetTop;
				const bottom = parent.bottom - offsetBottom;
				const deltaTop = rect.top - top;
				const deltaBottom = bottom - rect.bottom;

				return [
					deltaTop >= 0 && deltaBottom >= 0,
					deltaTop < 0 ? deltaTop : -deltaBottom,
				];
			};

			try {
				const [inView, elementPosition] = elementInView(el, scrollArea);

				if (!inView) {
					scrollArea.scrollTo(
						0,
						scrollArea.scrollTop + elementPosition
					);
				}

				return;
			} catch (error) {
				//
			}

			el.scrollIntoView();
		}
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

	onDataUpdated((newData) => {
		const newChoicesValues = sectionedChoices(newData, query, {
			valuesOnly: true,
		});

		const newSelection =
			newChoicesValues[activeChoiceIndexRef.current]?.value;

		if (!newSelection) return navigateToStart();

		setTimeout(() => navigate(newSelection));
	});

	onNavigateDown(() => navigate("down"));

	onNavigateUp(() => navigate("up"));

	onEscape((payload) => handleEscape(payload));

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
					className="popover-input bg-transparent h-full flex-1 border-none shadow-none px-0 py-3 text-xl focus:outline-none placeholder-content/30"
					placeholder={page?.placeholder || "Type to search actions"}
					// onKeyDown={onKeyDown}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						navigateToStart();
					}}
				/>

				<SpotlightPageFilters page={page} />
			</div>

			<div
				id="scrollArea"
				className="relative overflow-auto grid grid-cols-12"
				style={{ height: "calc(100vh - 100px)" }}
			>
				<div className={preview?.type ? "col-span-5" : "col-span-12"}>
					{Children.count(children) ? (
						children
					) : (
						<>
							{!searchResults?.length && query?.length > 0 && (
								<div className="rounded relative cursor-default select-none py-2 truncate text-[14px] text-content/30 text-center font-medium">
									No results
								</div>
							)}
							{searchResults.map(([section, choices], idx) => {
								if (grid) {
									return (
										<SpotlightGrid
											key={
												section +
												"" +
												idx +
												pageDataVersion
											}
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
												idx != searchResults.length - 1,
										})}
									>
										{section && section != "undefined" && (
											<span
												className={clsx(
													"mt-5 mb-1 tracking-wide text-xs font-semibold opacity-50 px-4 flex items-center",
													{
														uppercase:
															choiceSections?.length,
													}
												)}
											>
												{section}
											</span>
										)}

										{choices.map((choice) => {
											const { icon, image, video } =
												choice;

											return (
												<SpotlightListItem
													key={choice.__id}
													className="cursor-default"
													trailing={
														icon?.length ? (
															<div
																className="mr-2"
																dangerouslySetInnerHTML={{
																	__html: icon,
																}}
															/>
														) : (
															(image?.length ||
																video?.length) && (
																<div className="mr-2 h-8 relative flex-shrink-0 bg-content/10 border border-content/10 overflow-hidden aspect-[1.3/1] rounded">
																	<img
																		className={
																			"absolute size-full object-cover"
																		}
																		src={
																			image?.length
																				? image
																				: video
																		}
																		alt=""
																	/>

																	{video?.length && (
																		<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
																			<div className="relative size-3 flex items-center justify-center rounded-full overflow-hidden bg-card">
																				<div className="absolute inset-0 bg-content/60"></div>
																				<svg
																					className="size-3 ml-0.5 relative text-canvas"
																					viewBox="0 0 24 24"
																					fill="currentColor"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
																					/>
																				</svg>
																			</div>
																		</div>
																	)}
																</div>
															)
														)
													}
													label={choice.label}
													value={choice.value}
													focused={
														activeChoice ==
														choice.value
													}
													onClick={() =>
														handleSelect(
															choice.value
														)
													}
												/>
											);
										})}
									</div>
								);
							})}
						</>
					)}
				</div>
				{preview?.type && (
					<div className="col-span-7 overflow-hidden p-0.5">
						<div className="fixed top-14 bottom-0 right-0 w-7/12">
							<div className="h-full w-full border-l border-content/10 overflow-x-hidden overflow-y-auto">
								{preview}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
