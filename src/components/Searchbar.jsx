import { useRef, useState } from "react";
import Input from "./Input";
import clsx from "clsx";

export default function Searchbar({ autoFocus, onSubmit, onGoBack }) {
	const [searchQuery, setSearchQuery] = useState();
	const wrapperRef = useRef(null);

	const input = () => {
		return wrapperRef.current.querySelector("input");
	};

	const handleClear = () => {
		setSearchQuery("");
		input()?.focus();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		input()?.blur();
		// if (query?.length && query != searchQuery) setSearchQuery(query);
		// searchbar.current.blur();

		if (_.isFunction(onSubmit)) {
			onSubmit(searchQuery);
		}
	};

	return (
		<form
			ref={wrapperRef}
			className="relative w-full flex items-center h-12 pl-10 pr-5 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30"
			onSubmit={handleSubmit}
		>
			{_.isFunction(onGoBack) && (
				<button
					type="button"
					className="absolute z-10 inset-y-0 left-0 rounded-l-full pl-2 pr-1 flex items-center justify-center"
					onClick={onGoBack}
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
				id="searchbar"
				autoFocus={autoFocus}
				type="text"
				className="w-full h-full bg-transparent text-xl/none placeholder:text-content/30 focus:outline-none"
				placeholder="Type to search..."
				value={searchQuery}
				onChange={setSearchQuery}
				onEnter={handleSubmit}
			/>

			<button
				type="button"
				className={clsx(
					"absolute top-0 bottom-0 my-auto right-1.5 w-8 h-8 flex items-center justify-center rounded-full",
					{
						"opacity-0": !searchQuery,
					}
				)}
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
					/>
				</svg>
			</button>
		</form>
	);
}
