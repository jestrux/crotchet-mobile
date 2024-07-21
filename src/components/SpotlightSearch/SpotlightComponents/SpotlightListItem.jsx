import { useEffect, useRef } from "react";
import { ComboboxOption } from "@/components/reach-combobox";
import { useSpotlightPageContext } from "../SpotlightSearchPage/SpotlightPageContext";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export const defaultSpotlightSearchItemLeading = (
	<svg
		className="mt-0.5 w-4 h-4 opacity-80"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
		/>
	</svg>
);

function SpotlightListItem({
	id = "",
	value,
	leading = defaultSpotlightSearchItemLeading,
	trailing = "",
	children,
	label,
	className = "",
	onSelect,
	onFocus,
	onBlur,
	replace,
}) {
	const hoverObserverRef = useRef();
	const optionRef = useRef();
	const { searchTerm } = useSpotlightPageContext();
	replace = replace ?? (children && typeof children == "function");

	let content =
		replace && typeof children == "function" ? (
			children()
		) : (
			<div
				className={`${className} h-12 flex items-center gap-2 px-4 text-base leading-none`}
			>
				{!replace && leading != null && (
					<div className="w-5 flex-shrink-0">{leading}</div>
				)}
				<div className="flex-1">{children || label || value}</div>
				{!replace && (
					<span
						className={`flex-shrink-0 ml-auto text-sm ${
							typeof trailing == "string" && "opacity-40"
						}`}
					>
						{trailing}
					</span>
				)}
			</div>
		);

	const handleSelect = () => {
		if (typeof onSelect == "function") onSelect(value);
	};

	const handleFocus = () => {
		if (typeof onFocus == "function") onFocus(value);
	};

	const observeForHover = (element) => {
		hoverObserverRef.current = new MutationObserver((mutations) => {
			const mutation = mutations.find(({ type }) => type == "attributes");
			if (mutation) {
				if (
					mutation.attributeName == "data-on-click" &&
					mutation.target.getAttribute("data-on-click")
				) {
					mutation.target.removeAttribute("data-on-click");
					handleSelect();
				}

				if (
					mutation.attributeName == "data-on-focus" &&
					mutation.target.getAttribute("data-on-focus")
				) {
					mutation.target.removeAttribute("data-on-focus");
					handleFocus();
				}

				if (
					[typeof onFocus, typeof onBlur].includes("function") &&
					mutation.attributeName == "aria-selected"
				) {
					const selected = [true, "true"].includes(
						mutation.target.ariaSelected
					);

					if (selected && typeof onFocus == "function") handleFocus();
					else if (typeof onBlur == "function")
						onBlur(mutation.target.getAttribute("data-value"));
				}
			}
		});

		hoverObserverRef.current.observe(element, {
			attributes: true,
		});
	};

	useEffect(() => {
		const ref = optionRef.current;

		if (ref) observeForHover(ref);

		return () => {
			if (hoverObserverRef.current) hoverObserverRef.current.disconnect();
		};
	}, []);

	if (searchTerm?.length) {
		try {
			const matched = value
				.toString()
				.toLowerCase()
				.includes(searchTerm.toString().toLowerCase());

			if (!matched) return null;
		} catch (error) {
			//
		}
	}

	if (value === undefined) return content;

	return (
		<ComboboxOption
			ref={optionRef}
			id={id}
			className={`cursor-pointer ${
				replace ? className : ""
			} list-none sfocus:outline-none`}
			data-value={value}
			value={value}
			onClick={handleSelect}
			onFocus={handleFocus}
		>
			{content}
		</ComboboxOption>
	);
}

SpotlightListItem.NavIcon = (
	<ChevronRightIcon className="w-4 opacity-40" strokeWidth={2} />
);

export default SpotlightListItem;
