import { Children, useRef } from "react";
import {
	Combobox,
	ComboboxInput,
	ComboboxPopover,
	useComboboxContext,
} from "@/components/reach-combobox";
import useKeyDetector from "@/hooks/useKeyDetector";
import useEventListener from "@/hooks/useEventListener";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import SpotlightPageActions from "./SpotlightPageActions";
import ActionPage from "./ActionPage";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import DataPage from "./DataPage";

function SearchPageContent({
	open,
	placeholder,
	searchTerm,
	setSearchTerm,
	page = { type: "search" },
	onPopAll,
	onPop,
	onClose,
	onOpen,
	onReady,
	onSelect,
	onEscape,
	children,
}) {
	const navValue = useRef();
	const popoverTitleRef = useRef(null);
	const containerRef = useRef(null);
	const inputRef = useRef(null);
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

	const handleEscape = ({ close, popAll } = {}) => {
		if (!open) return;

		const combobox = popoverTitleRef.current.closest(
			"#spotlightSearchWrapper"
		);
		if (document.querySelector(".pier-message-modal")) return;
		if (combobox.className.indexOf("pier-menu-open") != -1)
			return containerRef.current.focus();

		if (inputRef.current.value.length) {
			setSearchTerm("");
			navigateToStart();

			if (popAll && typeof onPopAll == "function") onPopAll();

			return;
		}

		if (close) return onClose();
		if (!popAll && typeof onPop == "function") return onPop();
		if (popAll && typeof onPopAll == "function") return onPopAll();

		onClose();
	};

	const getChoices = () =>
		Array.from(
			popoverTitleRef.current
				?.closest("#spotlightSearchWrapper")
				.querySelectorAll(`[data-reach-combobox-option]`) ?? []
		);

	const handleNavigate = (dir) => {
		const options = getChoices().map((item) =>
			item.getAttribute("data-value")
		);
		let nextIndex = 0;

		if (!options.length) return;

		if (dir && navValue.current) {
			const index = options.findIndex(
				(option) => option === navValue.current
			);

			if (dir == "down") {
				if (index == options.length - 1) nextIndex = 0;
				else nextIndex = index + 1;
			}
			if (dir == "up") {
				if (index == 0) nextIndex = options.length - 1;
				else nextIndex = index - 1;
			}
		}

		const value = options[nextIndex];
		navValue.current = value;
		comboboxData.transition("NAVIGATE", {
			value,
		});
	};

	useEventListener("click", () => {
		if (open) inputRef.current.focus();
	});

	useKeyDetector({
		key: "ArrowDown",
		action: () => handleNavigate("down"),
	});

	useKeyDetector({
		key: "ArrowUp",
		action: () => handleNavigate("up"),
	});

	onEscape((payload) => {
		handleEscape(payload);
	});

	onOpen(() => {
		inputRef.current.focus();
		if (inputRef.current.value?.length) inputRef.current.select();
	});

	onReady(() => {
		navigateToStart();
	});

	onSelect((value, fromManualClick) => {
		navValue.current = value;
		navigateToValue(value);

		if (fromManualClick) return;

		const selected = getChoices().find(
			(item) => item.getAttribute("data-value") == value
		);

		if (selected) {
			selected.setAttribute("data-on-click", true);
			setTimeout(() => {
				if (selected.getAttribute("data-on-click")) {
					selected.removeAttribute("data-on-click");
					selected.click();
				}
			}, 10);
		}
	});

	const handleSearchTermChange = (event) => {
		if (event.target.value === inputRef.current.value)
			setSearchTerm(event.target.value);

		navigateToStart();
	};

	const navigateToStart = () => navigateToValue();

	const navigateToValue = (value) => {
		setTimeout(() => {
			if (value) {
				return comboboxData.transition("NAVIGATE", {
					value,
				});
			}

			handleNavigate();
		});
	};

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
					onFocus={() => {
						navigateToValue(navValue.current);
					}}
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
				<ActionPage page={page}>{children}</ActionPage>
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
	onEscape,
	onOpen,
	onReady,
	onPop,
	onPopAll,
}) {
	const { searchTerm, setSearchTerm, navigationValue, setNavigationValue } =
		useSpotlightPageContext();
	const spotlightPageWrapperRef = useRef(null);
	const selectHandler = useRef(() => {});
	const onSelect = (callback) => (selectHandler.current = callback);

	const comboProps = {
		placeholder: page?.placeholder || "Type to search actions",
		searchTerm,
		setSearchTerm,
		navigationValue,
		setNavigationValue,
		open,
		page,
		onClose,
		onEscape,
		onOpen,
		onReady,
		onPop,
		onSelect,
		onPopAll,
		pageData,
	};

	const getChildren = () => {
		if (Children.count(children)) return children;

		return <DataPage page={page} pageData={pageData} />;
	};

	return (
		<div id="spotlightSearchWrapper" ref={spotlightPageWrapperRef}>
			<Combobox
				className="w-full text-content is-grid"
				openOnFocus
				onSelect={selectHandler.current}
			>
				<SearchPageContent {...comboProps}>
					{getChildren()}
				</SearchPageContent>
			</Combobox>
		</div>
	);
}
