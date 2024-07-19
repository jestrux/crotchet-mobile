import { useEffect, useRef } from "react";
import {
	Combobox,
	ComboboxInput,
	ComboboxPopover,
	useComboboxContext,
} from "@/components/reach-combobox";
import useKeyDetector from "@/hooks/useKeyDetector";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import SpotlightPageActions from "./SpotlightPageActions";
import ActionPage from "./ActionPage";
import clsx from "clsx";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import SourcePage from "./SourcePage";

function SearchPageContent({
	open,
	placeholder,
	searchTerm,
	setSearchTerm,
	setNavigationValue,
	page = { type: "search" },
	onPopAll,
	onPop,
	onClose,
	children,
}) {
	const popoverTitleRef = useRef(null);
	const containerRef = useRef(null);
	const inputRef = useRef(null);
	const lastComboboxUpdate = useRef(Date.now());
	const comboboxData = useComboboxContext();

	const onKeyDown = (event) => {
		if (!event.isDefaultPrevented()) {
			const outerContainer = containerRef.current;
			if (!outerContainer) return;

			window.requestAnimationFrame(() => {
				const element = outerContainer.querySelector(
					"[aria-selected=true]"
				);
				if (!element) return;

				const container = element.closest("#popoverContent");

				if (container && element) {
					const top = element.offsetTop - container.scrollTop;
					const bottom =
						container.scrollTop +
						container.clientHeight -
						(element.offsetTop + element.clientHeight);

					if (bottom < 0) container.scrollTop -= bottom;
					if (top < 0) container.scrollTop += top;
				}
			});
		}
	};

	useEffect(() => {
		if (open) {
			inputRef.current.focus();
			// inputRef.current.select();

			setTimeout(() => {
				if (page?.type == "form") {
					const firstInput = document.querySelector(
						"#popoverContent input, #popoverContent textarea"
					);
					if (firstInput) firstInput.focus();
				}
			}, 20);
		} else inputRef.current.blur();
	}, [open]);

	useEffect(() => {
		lastComboboxUpdate.current = Date.now();
	}, [comboboxData]);

	useEffect(() => {
		if (typeof comboboxData?.navigationValue != "function")
			setNavigationValue(comboboxData?.navigationValue);
	}, [comboboxData?.navigationValue]);

	const handleEscape = ({ close, popAll } = {}) => {
		const combobox = popoverTitleRef.current.closest(
			"#spotlightSearchWrapper"
		);
		if (document.querySelector(".pier-message-modal")) return;
		if (combobox.className.indexOf("pier-menu-open") != -1)
			return containerRef.current.focus();

		const delta = (Date.now() - lastComboboxUpdate.current) / 1000;
		if (delta > 0.3) {
			if (close) onClose();
			else if (inputRef.current.value.length) setSearchTerm("");
			else if (!popAll && typeof onPop == "function") onPop();
			else if (typeof onPopAll == "function") onPopAll();
			else onClose();
		}
	};

	useKeyDetector({
		key: "Escape",
		delayBy: 50,
		action: (e) => handleEscape({ popAll: e.shiftKey }),
	});

	const handleSearchTermChange = (event) => {
		if (event.target.value === inputRef.current.value)
			setSearchTerm(event.target.value);
	};

	let content = children;
	if (page.source) content = <SourcePage page={page} />;

	return (
		<>
			<div
				ref={popoverTitleRef}
				id="popoverTitle"
				className={`h-14 px-4 flex items-center ${
					comboboxData.isExpanded &&
					"border-b border-content/10 z-10 relative"
				}`}
			>
				{typeof onPop == "function" && (
					<button
						type="button"
						className="flex-shrink-0 -ml-1.5 mr-2.5 bg-content/10 rounded flex items-center justify-center w-7 h-7"
						onClick={() => onPop()}
					>
						<ArrowLeftIcon width={13} strokeWidth={3} />
					</button>
				)}

				<ComboboxInput
					type="text"
					ref={inputRef}
					className="popover-input bg-transparent h-full w-full border-none shadow-none px-0 py-3 text-xl focus:outline-none placeholder-content/30"
					readOnly={["color"].includes(page.type)}
					placeholder={placeholder}
					value={searchTerm}
					onChange={handleSearchTermChange}
					autocomplete={false}
					selectOnClick
					onKeyDown={onKeyDown}
				/>

				<SpotlightPageActions page={page} />
			</div>

			<ComboboxPopover
				id="popoverContent"
				ref={containerRef}
				portal={false}
				className="-mt-0.5 relative w-screen overflow-auto focus:outline-none"
				style={{ height: "calc(100vh - 100px)" }}
			>
				<ActionPage page={page}>{content}</ActionPage>
			</ComboboxPopover>
		</>
	);
}

export default function SearchPageWrapper({
	open,
	children,
	page,
	pageData,
	onClose,
	onPop,
	onPopAll,
}) {
	const { searchTerm, setSearchTerm, navigationValue, setNavigationValue } =
		useSpotlightPageContext();
	const spotlightPageWrapperRef = useRef();
	const handleSelect = (value) => {
		document.dispatchEvent(
			new CustomEvent("spotlight-search-value-changed", {
				detail: {
					page,
					value,
				},
			})
		);

		const selected = spotlightPageWrapperRef.current.querySelector(
			`[data-reach-combobox-option][data-value="${value}"]`
		);

		if (selected) selected.dispatchEvent(new CustomEvent("on-select"));
	};

	const comboProps = {
		placeholder: page?.placeholder || "Type to search actions",
		searchTerm,
		setSearchTerm,
		navigationValue,
		setNavigationValue,
		open,
		page,
		onClose,
		onPop,
		onPopAll,
		pageData,
	};

	return (
		<Combobox
			ref={spotlightPageWrapperRef}
			id="spotlightSearchWrapper"
			className={clsx("w-full text-content", {
				// "is-grid": isGrid,
			})}
			openOnFocus
			onSelect={handleSelect}
		>
			<SearchPageContent {...comboProps}>{children}</SearchPageContent>
		</Combobox>
	);
}
