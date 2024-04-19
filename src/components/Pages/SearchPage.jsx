import { useEffect, useRef, useState } from "react";
import GlobalSearch from "../GlobalSearch";
import clsx from "clsx";
import useKeyboard from "@/hooks/useKeyboard";
import {
	onDesktop,
	DataWidget,
	Input,
	camelCaseToSentenceCase,
} from "@/crotchet";
import useStickyObserver from "@/hooks/useStickyObserver";

export default function SearchPage({
	background,
	filterColor,
	autoFocus = true,
	inBottomSheet,
	placeholder,
	query: _query,
	source = {},
	collapse,
	debounce = false,
	global = false,
}) {
	placeholder =
		placeholder ||
		`Type to search${
			source?.name?.length
				? " " + camelCaseToSentenceCase(source?.name).toLowerCase()
				: ""
		}...`;

	const navRef = useRef(null);
	const stuck = useStickyObserver(navRef.current);
	const { KeyboardPlaceholder } = useKeyboard();
	const [searchQuery, setSearchQuery] = useState(_query ?? "");
	const [filters, setFilters] = useState(null);
	const searchbar = useRef(null);
	const [filter, _setFilter] = useState("");
	const setFilter = (value) => {
		_setFilter(value);

		// try {
		// 	await Preferences.set({
		// 		key: (source?.name || "") + "filter",
		// 		value,
		// 	});
		// } catch (error) {
		// 	/* empty */
		// }
	};

	const getFilters = () => {
		source
			.handler()
			.then(
				(data) =>
					data &&
					data.map((entry) =>
						typeof source.mapEntry == "function"
							? { ...entry, ...source.mapEntry(entry) }
							: entry
					)
			)
			.then((data) => {
				if (!data?.length) return;

				setFilters([
					...new Set(
						data.map((entry) => entry[source.filter]).flat()
					),
				]);
			});
	};

	useEffect(() => {
		if (source?.filter && !filters) getFilters();
		// searchbar.current.select();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [source]);

	const handleClear = () => {
		setSearchQuery("");

		const input = searchbar.current;

		if (input?.getAttribute("is-focused")) searchbar.current?.focus();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		searchbar.current?.blur();
		// if (query?.length && query != searchQuery) setSearchQuery(query);
		// searchbar.current.blur();
	};

	const filterProps = (selected) => {
		return {
			className: clsx(
				"flex-shrink-0 focus:outline-none rounded-lg border inline-flex items-center justify-center h-8 px-2.5 text-center text-xs uppercase font-bold",
				selected
					? filterColor?.length
						? `bg-[${filterColor}] border-[${filterColor}] dark:bg-white/10 dark:border-white/10 dark:text-white`
						: "bg-content/5 border-content/20 dark:bg-white/10 dark:border-white/10 dark:text-white"
					: "opacity-70 border-transparent"
			),
			style: {
				wordSpacing: "0.25rem",
				// background: selected && filterColor?.length ? filterColor : "",
				// borderColor: selected && filterColor?.length ? filterColor : "",
			},
		};
	};

	return (
		<>
			<div
				ref={navRef}
				className={clsx("sticky top-0 z-10 w-full flex flex-col", {
					"bg-stone-100/95 dark:!bg-card/95 dark:text-white backdrop-blur":
						stuck,
				})}
			>
				<div
					className="absolute inset-0 dark:hidden"
					style={{ background }}
				></div>

				<div
					className="relative w-full flex flex-col"
					style={{
						...(onDesktop()
							? {
									marginTop: "2rem",
							  }
							: {
									marginTop: "env(safe-area-inset-top)",
							  }),
					}}
				>
					<div className="py-2 px-3 w-full flex items-center gap-1">
						<form
							className="flex-1 relative"
							onSubmit={handleSubmit}
						>
							{inBottomSheet && (
								<button
									type="button"
									className="absolute z-10 inset-y-0 left-0 rounded-l-full pl-2 pr-1 flex items-center justify-center"
									onClick={collapse}
								>
									<svg
										className="w-6 opacity-40"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="2"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M15.75 19.5 8.25 12l7.5-7.5"
										/>
									</svg>
								</button>
							)}

							<Input
								ref={searchbar}
								autoFocus={autoFocus}
								type="text"
								className={clsx(
									"w-full h-12 dark:bg-content/5 border border-content/5 text-xl/none placeholder:text-content/30 focus:outline-none",
									filterColor?.length
										? `bg-[${filterColor}]`
										: "bg-content/5",
									inBottomSheet
										? "rounded-full px-10"
										: "rounded-md px-4"
								)}
								placeholder={placeholder}
								autoComplete="off"
								name="q"
								value={searchQuery}
								onChange={setSearchQuery}
								onEnter={handleSubmit}
								{...(debounce ? { debounce } : {})}
							/>

							{searchQuery && (
								<button
									className="absolute top-0 bottom-0 my-auto right-1.5 w-8 h-8 flex items-center justify-center rounded-full"
									onClick={handleClear}
								>
									<svg
										className="w-4"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18 18 6M6 6l12 12"
										></path>
									</svg>
								</button>
							)}
						</form>
					</div>

					{filters?.length && (
						<div className="px-3 pb-2 w-screen overflow-x-auto">
							<div className="max-w-4xl mx-auto flex items-center gap-2">
								<button
									data-group-filter="All"
									{...filterProps(!filter)}
									onClick={() => setFilter("")}
								>
									All
								</button>
								{filters.map((group) => (
									<button
										key={group}
										data-group-filter={group}
										{...filterProps(filter == group)}
										onClick={() => setFilter(group)}
									>
										{group}
									</button>
								))}

								<span>&nbsp;</span>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="p-3">
				{global && (
					<div className="-mx-5">
						<GlobalSearch searchQuery={searchQuery} />
					</div>
				)}

				{!global && source && (
					<DataWidget
						source={source}
						searchQuery={searchQuery}
						{...(!source?.filter
							? {}
							: {
									filters: { [source.filter]: filter },
							  })}
						widgetProps={{ noPadding: true }}
					/>
				)}

				{!inBottomSheet && <KeyboardPlaceholder />}
			</div>
		</>
	);
}
