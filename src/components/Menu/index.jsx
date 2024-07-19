import {
	Fragment,
	useState,
	useRef,
	forwardRef,
	useCallback,
	useEffect,
} from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import CommandKey from "../CommandKey";
import useKeyDetector from "@/hooks/useKeyDetector";
import { objectFieldChoices, randomId } from "@/utils";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { createPortal } from "react-dom";
import { usePopper } from "./usePopper";

export default forwardRef(function Menu(
	{
		width = "180px",
		plain = false,
		onTopMenu = false,
		choices = [],
		value,
		onChange = () => {},
		trigger,
	},
	forwardedRef
) {
	const actionKey = "Shift + L";
	const wrapperRef = useRef();
	const idRef = useRef("pier-menu-open-" + randomId());
	const closedRef = useRef();
	let [triggerRef, containerRef] = usePopper({
		placement: "bottom-end",
		strategy: "fixed",
		modifiers: [{ name: "offset", options: { offset: [0, 10] } }],
	});
	const [selected, setSelected] = useState(value);
	if (forwardedRef) forwardedRef.current = triggerRef.current;

	const handleSelect = (value) => {
		setSelected(value);
		onChange(value);
	};

	const doProcess = useCallback((open) => {
		const spotlightParent = wrapperRef.current?.closest(
			"#spotlightSearchWrapper"
		);

		if (open) spotlightParent.classList.add(idRef.current);
		if (!open) {
			setTimeout(() => {
				spotlightParent.classList.remove(idRef.current);
				spotlightParent.querySelector("input").focus();
			});
		}
	}, []);

	useKeyDetector({
		key: actionKey,
		action: () => {
			if (
				!onTopMenu ||
				!wrapperRef.current ||
				!wrapperRef.current.querySelector(`#menuTriggerButton`)
			)
				return;

			wrapperRef.current.querySelector(`#menuTriggerButton`).click();
		},
	});

	useOnClickOutside(
		wrapperRef,
		() => closedRef.current == false && triggerRef.current.click()
	);

	const formattedChoices = objectFieldChoices(choices);
	const selectedLabel =
		formattedChoices.find(({ value }) => value == selected)?.label ??
		selected;

	return (
		<div
			ref={wrapperRef}
			// style={{ width }}
		>
			<Listbox value={selected} onChange={handleSelect}>
				{({ open }) => {
					// doProcess(open);

					return (
						<div className="relative flex justify-end">
							<Listbox.Button
								ref={triggerRef}
								id="menuTriggerButton"
								onFocus={() => doProcess(open)}
								className={
									trigger
										? ""
										: `relative w-full cursor-default rounded-md h-9 pl-2.5 focus:outline-none focus-visible:border-content/20 text-xs font-medium
                                ${
									plain
										? " text-right pr-5 opacity-60"
										: " border border-content/20 pr-10 text-left"
								}
                                `
								}
							>
								{trigger ? (
									trigger
								) : (
									<>
										<span className="block truncate opacity-90">
											{selectedLabel}
										</span>

										<span
											className={`pointer-events-none absolute inset-y-0 right-0 flex items-center ${
												plain ? " " : " pr-1 opacity-70"
											}`}
										>
											{onTopMenu && (
												<CommandKey label={actionKey} />
											)}

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
							</Listbox.Button>

							<Portal>
								<Transition
									as={Fragment}
									leave="transition ease-in duration-100"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<Listbox.Options
										className="z-10 pier-spotlight-actions absolute mt-1 w-56 max-h-60 overflow-auto rounded-md bg-card py-1 border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-xs"
										style={{ width }}
										ref={containerRef}
									>
										{formattedChoices.map(
											(choice, choiceIdx) => (
												<Listbox.Option
													key={choiceIdx}
													className={({ active }) =>
														`relative cursor-default select-none py-2 pl-2.5 pr-10 ${
															active
																? "bg-content/5"
																: ""
														}`
													}
													value={choice.value}
												>
													{({ selected, active }) => (
														<>
															<span
																className={`block truncate text-xs font-semibold ${
																	selected ||
																	active
																		? ""
																		: "text-content/50"
																}`}
															>
																{choice.label}
															</span>
															{selected ? (
																<span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
																	<CheckIcon
																		className="h-3.5 w-3.5"
																		aria-hidden="true"
																		strokeWidth={
																			2.8
																		}
																	/>
																</span>
															) : null}
														</>
													)}
												</Listbox.Option>
											)
										)}
									</Listbox.Options>
								</Transition>
							</Portal>
						</div>
					);
				}}
			</Listbox>
		</div>
	);
});

function Portal({ children }) {
	let [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return null;
	return createPortal(children, document.body);
}
