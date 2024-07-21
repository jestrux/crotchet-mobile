import { matchSorter } from "match-sorter";
import { useState, useRef, useCallback, forwardRef } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {
	objectFieldChoices,
	randomId,
	dispatch,
	useOnInit,
	useEventListener,
	useKeyDetector,
} from "@/crotchet";
import { usePopper } from "./usePopper";
import clsx from "clsx";

const SpotLightPageMenuContent = forwardRef(function SpotLightPageMenuContent(
	{ idRef, choices, width, onSelect, onOpen, onClose },
	containerRef
) {
	let formattedChoices = objectFieldChoices(choices).map((choice) => {
		if (choice.group) choice.groupTag = `${choice.group} ${choice.label}`;
		return choice;
	});
	const [activeChoice, setActiveChoice] = useState(formattedChoices[0].value);
	const [query, setQuery] = useState("");
	const inputRef = useRef(null);

	formattedChoices =
		query === ""
			? formattedChoices
			: matchSorter(formattedChoices, query, {
					keys: ["label", "groupTag"],
			  });

	if (query?.length) formattedChoices = _.sortBy(formattedChoices, ["group"]);

	formattedChoices = formattedChoices.reduce((agg, choice, idx) => {
		const group = choice?.group;
		const prevGroup = formattedChoices[idx - 1]?.group;
		const nextGroup = formattedChoices[idx + 1]?.group;

		if (group && (idx == 0 || prevGroup != group)) {
			agg.push({
				groupStart: true,
				label: group,
				__id: choice.__id + "group-start",
			});
		}

		agg.push(choice);

		if (nextGroup != group && idx < formattedChoices.length - 1) {
			agg.push({
				groupEnd: true,
				label: group,
				__id: choice.__id + "group-end",
			});
		}

		return agg;
	}, []);

	const getContainer = () => inputRef.current.closest("#menuContent");

	const handleSelect = (value) => {
		onSelect(value);
	};

	useOnInit(() => {
		onOpen();
		setTimeout(() => {
			if (inputRef.current) inputRef.current.focus();
		});
	});

	useEventListener("click", () => {
		if (inputRef.current) inputRef.current.focus();
	});

	useEventListener(`key-` + idRef.current, (_, key) => {
		if (key == "Escape") return handleEscape();

		if (key == "Enter" && activeChoice) return handleSelect(activeChoice);

		onNavigate(key.replace("Arrow", "").toLowerCase());
	});

	const onKey = (e) => {
		dispatch(`key-` + idRef.current, e.key);
	};

	useKeyDetector({
		key: ["Escape", "Enter", "ArrowUp", "ArrowDown"],
		action: onKey,
	});

	const onNavigate = (value) => {
		const options = getContainer().querySelectorAll("[data-choice]");

		if (!options?.length) return setActiveChoice(null);

		const values = Array.from(options).map((option) =>
			option.getAttribute("data-choice")
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

	const handleEscape = () => {
		if (!query?.length) return onClose();

		setQuery("");
		setTimeout(() => onNavigate());
	};

	return (
		<div
			id="menuContent"
			className="z-10 absolute w-56 rounded-md overflow-hidden bg-card border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-xs"
			style={{ width }}
			ref={containerRef}
		>
			<div className="sticky top-0 bg-card z-10 border-b border-content/10">
				<input
					ref={inputRef}
					type="text"
					className="placeholder:text-content/30 border-none"
					placeholder="Type to search"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setTimeout(() => onNavigate());
					}}
				/>
			</div>

			<div
				id="scrollArea"
				className="relative p-1 max-h-60 overflow-auto"
			>
				{!formattedChoices?.length && (
					<div className="rounded relative cursor-default select-none py-2 truncate text-[14px] text-content/30 text-center font-medium">
						No results
					</div>
				)}

				{formattedChoices.map((choice, idx) => {
					const active = activeChoice == choice.value;

					if (choice.groupStart) {
						return (
							<div
								key={"group-start" + choice.__id}
								className={clsx(
									"mb-1 text-[11px]/none tracking-wider uppercase font-medium text-content/40 pl-2",
									{ "mt-1": idx == 0 }
								)}
							>
								{choice.label}
							</div>
						);
					}

					if (choice.groupEnd) {
						return (
							<div
								key={"group-end" + choice.__id}
								className="-mx-1 mt-1 pt-3 border-t border-content/[0.07]"
							></div>
						);
					}

					return (
						<div
							key={choice.__id}
							data-choice={choice.value}
							className={clsx(
								"rounded relative cursor-default select-none p-2 truncate text-[14px] font-medium",
								active
									? "bg-content/5 text-content/70"
									: "text-content/60"
							)}
							style={{
								scrollMarginTop: "20px",
							}}
							onClick={() => handleSelect(choice.value)}
						>
							{choice.label}
						</div>
					);
				})}
			</div>
		</div>
	);
});

export default function SpotLightPageMenu({
	width = "180px",
	plain = false,
	choices = [],
	onChange = () => {},
	trigger,
}) {
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef();
	const idRef = useRef("menu-open-" + randomId());
	const closedRef = useRef();
	const [triggerRef, containerRef] = usePopper({
		placement: "bottom-end",
		strategy: "fixed",
		modifiers: [{ name: "offset", options: { offset: [0, 10] } }],
	});

	const handleSelect = (value) => {
		onClose();
		onChange(value);
	};

	const onClose = () => {
		setOpen(false);
		doProcess(false);
	};

	const onToggle = () => {
		setOpen((open) => {
			doProcess(!open);
			return !open;
		});
	};

	const doProcess = useCallback((open) => {
		const spotlightParent = wrapperRef.current?.closest(
			"#spotlightSearchWrapper"
		);

		if (!spotlightParent) return;

		if (open) spotlightParent.classList.add(idRef.current);
		if (!open) {
			var input = spotlightParent.querySelector("input");
			if (input) input.focus();
			wrapperRef.current.querySelector(`#menuTriggerButton`).blur();

			setTimeout(() => {
				spotlightParent.classList.remove(idRef.current);
			});
		}
	}, []);

	useOnClickOutside(
		wrapperRef,
		() => closedRef.current == false && triggerRef.current.click()
	);

	return (
		<div
			ref={wrapperRef}
			// style={{ width }}
		>
			<div className="relative flex justify-end">
				<button
					ref={triggerRef}
					id="menuTriggerButton"
					className={
						trigger
							? ""
							: `relative w-full cursor-default rounded-md h-9 pl-2 focus:outline-none focus-visible:border-content/20 text-xs font-medium
                                ${
									plain
										? " text-right pr-5 opacity-60"
										: " border border-content/20 pr-10 text-left"
								}
                                `
					}
					onClick={() => {
						onToggle();
					}}
				>
					{trigger ? (
						trigger
					) : (
						<>
							<span className="block truncate opacity-90">
								Choose One
							</span>

							<span
								className={`pointer-events-none absolute inset-y-0 right-0 flex items-center ${
									plain ? " " : " pr-1 opacity-70"
								}`}
							>
								<ChevronUpDownIcon
									className={` ${
										plain
											? " text-right h-4 w-4 "
											: " ml-0.5 opacity-60 h-5 w-5 "
									}`}
									aria-hidden="true"
								/>
							</span>
						</>
					)}
				</button>

				{/* <Transition
					as={Fragment}
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
					show={open}
				> */}
				{open && (
					<SpotLightPageMenuContent
						ref={containerRef}
						idRef={idRef}
						choices={choices}
						width={width}
						onSelect={handleSelect}
						onOpen={() => doProcess(true)}
						onClose={() => {
							doProcess(false);
							onClose();
						}}
					/>
				)}
				{/* </Transition> */}
			</div>
		</div>
	);
}
