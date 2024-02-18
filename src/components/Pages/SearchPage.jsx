import { useAppContext } from "@/providers/app";
import DataWidget from "../DataWidget";
import { dataSource } from "@/providers/data";
import { useEffect, useRef, useState } from "react";

export default function SearchPage({
	placeholder = "Type to search",
	query,
	source = dataSource.crotchet("heroicons"),
	maxHeight,
	collapse,
}) {
	const [searchQuery, setSearchQuery] = useState(query);
	const searchbar = useRef(null);
	const { actualSource } = useAppContext();

	useEffect(() => {
		searchbar.current.select();
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		setSearchQuery(e.target.q.value);
	};

	return (
		<div
			className="relative"
			style={{
				height: maxHeight + "px",
				overflow: "auto",
				borderTopLeftRadius: 32,
				borderTopRightRadius: 32,
			}}
		>
			<div
				className="fixed top-5 right-4 z-20"
				style={{
					marginTop: "env(safe-area-inset-top)",
				}}
			>
				<button
					className="w-6 h-6 flex items-center justify-center bg-content text-card shadow-sm rounded-full"
					onClick={collapse}
				>
					<svg
						className="w-4"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="2"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18 18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<form
				className="w-full pt-2 pb-2 pl-2 pr-14 sticky top-0 z-10 bg-card sbackdrop-blur"
				onSubmit={handleSubmit}
			>
				<input
					ref={searchbar}
					autoFocus
					type="search"
					className="w-full h-12 px-3 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30 focus:outline-none"
					placeholder={placeholder}
					defaultValue={query}
					name="q"
					autoComplete="off"
					onChange={(e) => {
						if (!e.target.value?.length) setSearchQuery("");
						else if (actualSource(source).provider == "crawler")
							setSearchQuery(e.target.value);
					}}
				/>
			</form>

			<div className="p-5 pt-2">
				{searchQuery?.length > 0 && (
					<div className="mb-1 text-content/50 truncate">
						Search results for{" "}
						<span className="font-bold">{searchQuery}</span>{" "}
					</div>
				)}

				<DataWidget
					key={searchQuery}
					source={source}
					query={searchQuery}
					widgetProps={{ noPadding: true }}
				/>
			</div>
		</div>
	);
}
