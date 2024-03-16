import DataWidget from "../DataWidget";
import { useEffect, useRef, useState } from "react";
import GlobalSearch from "../GlobalSearch";
import { Preferences } from "@capacitor/preferences";
import useDebounce from "@/hooks/useDebounce";
import { useDataFetch } from "@/providers/data";

export default function SearchPage({
	inBottomSheet,
	placeholder = "Type to search...",
	query: _query,
	source,
	maxHeight,
	collapse,
	layout,
	columns,
	liveSearch,
	global = false,
}) {
	liveSearch = liveSearch ?? source.searchable != true;
	const [searchQuery, setSearchQuery] = useState(_query ?? "");
	const [filters, setFilters] = useState(null);
	const debouncedQuery = useDebounce(searchQuery, liveSearch ? 0 : 500);
	const searchbar = useRef(null);
	const [filter, _setFilter] = useState("");
	const setFilter = async (value) => {
		_setFilter(value);

		// try {
		// 	await Preferences.set({
		// 		key: (source?.name || "") + "filter",
		// 		value,
		// 	});
		// } catch (error) {
		// 	/* empty */
		// }

		// refreshData();
	};

	const fetchParams = () => {
		return {
			clear: true,
			source,
			searchQuery,
			...(!source?.filter
				? {}
				: {
						filters: { [source.filter]: filter },
				  }),
		};
	};

	const {
		// error,
		isLoading,
		data,
		refetch: fetchEntries,
	} = useDataFetch(fetchParams());

	useEffect(() => {
		fetchEntries(fetchParams());
	}, [debouncedQuery, filter]);

	const getFilters = () => {
		source
			.handler()
			.then(
				(data) =>
					data &&
					data.map((entry) =>
						typeof source.mapEntry == "function"
							? source.mapEntry(entry)
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

		searchbar.current.select();
	}, []);

	const handleClear = () => {
		setSearchQuery("");
		searchbar.current.focus();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// if (query?.length && query != searchQuery) setSearchQuery(query);
		// searchbar.current.blur();
	};

	return (
		<div
			className="relative overflow-x-hidden overflow-y-auto"
			style={{
				height: maxHeight ?? window.innerHeight + "px",
				...(inBottomSheet
					? {
							borderTopLeftRadius: 32,
							borderTopRightRadius: 32,
					  }
					: {}),
			}}
		>
			<div
				className="sticky top-0 z-10 bg-card w-full flex flex-col"
				style={{
					...(!inBottomSheet
						? {
								paddingTop: "2rem",
						  }
						: {}),
				}}
			>
				<div className="p-2 w-full flex items-center gap-1">
					<form className="flex-1 relative" onSubmit={handleSubmit}>
						<input
							ref={searchbar}
							autoFocus
							type="text"
							className="w-full h-12 px-4 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30 focus:outline-none"
							placeholder={placeholder}
							autoComplete="off"
							value={searchQuery}
							name="q"
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyUp={(e) => {
								if (e.key == "Enter") e.preventDefault();
							}}
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

					{inBottomSheet && (
						<button
							className="mr-2 w-8 h-8 flex items-center justify-center"
							onClick={collapse}
						>
							<svg
								className="w-6 opacity-60"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="2"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m19.5 8.25-7.5 7.5-7.5-7.5"
								/>
							</svg>
						</button>
					)}
				</div>

				{filters && (
					<div className="px-3 pb-2 w-screen overflow-x-auto">
						<div className="max-w-4xl mx-auto flex items-center gap-2">
							<button
								data-group-filter="All"
								className={`${
									!filter
										? "bg-content/5 border-content/20 text-[--appbar-color] dark:bg-white/10 dark:border-white/10 dark:text-white"
										: "opacity-70 border-transparent"
								} flex-shrink-0 focus:outline-none rounded-lg border inline-flex items-center justify-center h-8 px-2.5 text-center text-xs uppercase font-bold`}
								onClick={() => setFilter("")}
							>
								All
							</button>
							{filters.map((group) => (
								<button
									key={group}
									data-group-filter={group}
									className={`${
										filter == group
											? "bg-content/5 border-content/20 text-[--appbar-color] dark:bg-white/10 dark:border-white/10 dark:text-white"
											: "opacity-70 border-transparent"
									} flex-shrink-0 focus:outline-none rounded-lg border inline-flex items-center justify-center h-8 px-2.5 text-center text-xs uppercase font-bold`}
									style={{ wordSpacing: "0.25rem" }}
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

			<div className="p-3">
				{global && <GlobalSearch searchQuery={searchQuery} />}

				{!global && source && (
					<>
						{searchQuery?.length > 0 && (
							<div className="text-content/50 truncate mb-2">
								Search results for{" "}
								<span className="font-bold">{searchQuery}</span>{" "}
							</div>
						)}

						<DataWidget
							layout={layout}
							columns={columns}
							data={data}
							isLoading={isLoading}
							widgetProps={{ noPadding: true }}
						/>
					</>
				)}
			</div>
		</div>
	);

	// return (
	// 	<div
	// 		className="relative"
	// 		style={{
	// 			height: maxHeight ?? window.innerHeight + "px",
	// 			overflow: "auto",
	// 			...(inBottomSheet
	// 				? {
	// 						borderTopLeftRadius: 32,
	// 						borderTopRightRadius: 32,
	// 				  }
	// 				: {}),
	// 		}}
	// 	>
	// 		<div
	// 			className="sticky top-0 z-10 bg-card w-full p-2 flex flex-col"
	// 			style={{
	// 				...(!inBottomSheet
	// 					? {
	// 							paddingTop: "2rem",
	// 					  }
	// 					: {}),
	// 			}}
	// 		>
	// 			<div className="w-full flex items-center gap-1">
	// 				<form className="flex-1 relative" onSubmit={handleSubmit}>
	// 					<input
	// 						ref={searchbar}
	// 						autoFocus
	// 						type="text"
	// 						className="w-full h-12 px-4 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30 focus:outline-none"
	// 						placeholder={placeholder}
	// 						autoComplete="off"
	// 						value={query}
	// 						name="q"
	// 						onChange={(e) => {
	// 							setQuery(e.target.value);
	// 							if (!e.target.value?.length || liveSearch)
	// 								setSearchQuery(e.target.value);
	// 						}}
	// 					/>

	// 					{query && (
	// 						<button
	// 							className="absolute top-0 bottom-0 my-auto right-1.5 w-8 h-8 flex items-center justify-center rounded-full"
	// 							onClick={handleClear}
	// 						>
	// 							<svg
	// 								className="w-4"
	// 								fill="none"
	// 								viewBox="0 0 24 24"
	// 								strokeWidth="1.5"
	// 								stroke="currentColor"
	// 							>
	// 								<path
	// 									strokeLinecap="round"
	// 									strokeLinejoin="round"
	// 									d="M6 18 18 6M6 6l12 12"
	// 								></path>
	// 							</svg>
	// 						</button>
	// 					)}
	// 				</form>

	// 				{inBottomSheet && (
	// 					<button
	// 						className="mr-2 w-8 h-8 flex items-center justify-center"
	// 						onClick={collapse}
	// 					>
	// 						<svg
	// 							className="w-6 opacity-60"
	// 							fill="none"
	// 							viewBox="0 0 24 24"
	// 							strokeWidth="2"
	// 							stroke="currentColor"
	// 						>
	// 							<path
	// 								strokeLinecap="round"
	// 								strokeLinejoin="round"
	// 								d="m19.5 8.25-7.5 7.5-7.5-7.5"
	// 							/>
	// 						</svg>
	// 					</button>
	// 				)}
	// 			</div>

	// 			<div
	// 				className="px-4 max-w-4xl mx-auto flex items-center gap-2"
	// 				style={{
	// 					marginTop: "env(safe-area-inset-top)",
	// 					height: "60px",
	// 				}}
	// 			>
	// 				<button
	// 					data-group-filter="All"
	// 					className={`${
	// 						!filter
	// 							? "bg-white border-white/20 text-[--appbar-color] dark:bg-white/10 dark:border-white/10 dark:text-white"
	// 							: "opacity-70 border-transparent"
	// 					} flex-shrink-0 focus:outline-none rounded-lg border inline-flex items-center justify-center h-8 px-2.5 text-center text-xs uppercase font-bold`}
	// 					onClick={() => setFilter("")}
	// 				>
	// 					All
	// 				</button>
	// 				{filters.map((group) => (
	// 					<button
	// 						key={group}
	// 						data-group-filter={group}
	// 						className={`${
	// 							filter == group
	// 								? "bg-white border-white/20 text-[--appbar-color] dark:bg-white/10 dark:border-white/10 dark:text-white"
	// 								: "opacity-70 border-transparent"
	// 						} flex-shrink-0 focus:outline-none rounded-lg border inline-flex items-center justify-center h-8 px-2.5 text-center text-xs uppercase font-bold`}
	// 						style={{ wordSpacing: "0.25rem" }}
	// 						onClick={() => setFilter(group)}
	// 					>
	// 						{group}
	// 					</button>
	// 				))}

	// 				<span>&nbsp;</span>
	// 			</div>
	// 		</div>

	// 		<div className="p-3">
	// 			{global && <GlobalSearch searchQuery={searchQuery} />}

	// 			{!global && source && (
	// 				<>
	// 					{searchQuery?.length > 0 && (
	// 						<div className="text-content/50 truncate mb-2">
	// 							Search results for{" "}
	// 							<span className="font-bold">{searchQuery}</span>{" "}
	// 						</div>
	// 					)}

	// 					<DataWidget
	// 						layout={layout}
	// 						columns={columns}
	// 						source={source}
	// 						searchQuery={searchQuery}
	// 						widgetProps={{ noPadding: true }}
	// 					/>
	// 				</>
	// 			)}
	// 		</div>
	// 	</div>
	// );
}
