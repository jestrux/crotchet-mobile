import DataWidget from "../DataWidget";
import { useEffect, useRef, useState } from "react";
import dataSource from "@/providers/data/dataSource";

export default function SearchPage({
	inBottomSheet,
	placeholder = "Type to search...",
	query: _query,
	source = dataSource.crotchet("heroicons"),
	maxHeight,
	collapse,
	layout,
	columns,
	liveSearch = false,
}) {
	const [query, setQuery] = useState(_query);
	const [searchQuery, setSearchQuery] = useState(_query);
	const searchbar = useRef(null);

	useEffect(() => {
		searchbar.current.select();
	}, []);

	const handleClear = () => {
		setQuery("");
		if (liveSearch) setSearchQuery("");
		searchbar.current.focus();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (query?.length && query != searchQuery) setSearchQuery(query);
		searchbar.current.blur();
	};

	return (
		<div
			className="relative"
			style={{
				height: maxHeight ?? window.innerHeight + "px",
				overflow: "auto",
				...(inBottomSheet
					? {
							borderTopLeftRadius: 32,
							borderTopRightRadius: 32,
					  }
					: {}),
			}}
		>
			<div
				className="sticky top-0 z-10 bg-card w-full p-2 flex items-center gap-1"
				style={{
					...(!inBottomSheet
						? {
								paddingTop: "2rem",
						  }
						: {}),
				}}
			>
				<form className="flex-1 relative" onSubmit={handleSubmit}>
					<input
						ref={searchbar}
						autoFocus
						type="text"
						className="w-full h-12 px-4 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30 focus:outline-none"
						placeholder={placeholder}
						autoComplete="off"
						value={query}
						name="q"
						onChange={(e) => {
							setQuery(e.target.value);
							if (!e.target.value?.length || liveSearch)
								setSearchQuery(e.target.value);
						}}
					/>

					{query && (
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

			<div className="p-3">
				{searchQuery?.length > 0 && (
					<div className="text-content/50 truncate mb-2">
						Search results for{" "}
						<span className="font-bold">{searchQuery}</span>{" "}
					</div>
				)}

				<DataWidget
					layout={layout}
					columns={columns}
					source={source}
					searchQuery={searchQuery}
					widgetProps={{ noPadding: true }}
				/>
			</div>
		</div>
	);
}
