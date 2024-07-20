import { useRef } from "react";
import SpotlightListItem from "./SpotlightListItem";
import { useSpotlightPageContext } from "../SpotlightSearchPage/SpotlightPageContext";
import clsx from "clsx";

export default function SpotlightGrid({
	aspectRatio,
	choices = [],
	columns = 4,
	previewOnly,
	onSelect,
	onChange,
}) {
	const gridRef = useRef(null);
	const navValue = useRef(1);
	const { onChange: onItemFocused } = useSpotlightPageContext();

	onItemFocused((value) => {
		navValue.current = value;
		if (typeof onChange == "function") onChange(choices[value]);
	});

	// const handleNavigate = (dir) => {
	// 	const options = choices;
	// 	const index = options.findIndex(
	// 		({ __index }) => __index === navValue.current
	// 	);
	// 	let nextIndex = 0;

	// 	if (index != -1) {
	// 		let column = Math.floor(index % chunks);
	// 		let row = Math.floor(index / chunks);
	// 		console.log("Column: ", column, "Row: ", row);

	// 		if (dir == "right") {
	// 			if (index == options.length - 1) nextIndex = 0;
	// 			else nextIndex = index + 1;
	// 		}
	// 		if (dir == "left") {
	// 			if (index == 0) nextIndex = options.length - 1;
	// 			else nextIndex = index - 1;
	// 		}
	// 		if (dir == "down") {
	// 			if (rows > 1 && row < rows - 1) {
	// 				nextIndex = (row + 1) * chunks + column;
	// 				while (nextIndex > options.length - 1) nextIndex -= 1;
	// 			} else nextIndex = column;
	// 		}
	// 		if (dir == "up") {
	// 			if (row > 0) nextIndex = (row - 1) * chunks + column;
	// 		}
	// 	}
	// };

	const handleSelect = (value) => {
		if (typeof onSelect == "function") onSelect(value);
	};

	return (
		<div
			ref={gridRef}
			className="grid mt-0.5 pt-2 pr-2"
			style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
		>
			{choices.map((entry) => (
				<SpotlightListItem
					className={clsx(
						"w-full",
						entry?.icon?.length
							? "p-3"
							: "pl-2 pb-2 spotlight-grid-item"
					)}
					key={entry.value}
					value={entry.value}
					onSelect={() => handleSelect(entry.value)}
					leading={null}
					trailing={null}
				>
					{() => {
						const { icon, image, video, title, subtitle } = entry;

						return (
							<div
								className={clsx(
									"w-full flex flex-col gap-1",
									icon?.length > 0
										? "items-center"
										: "items-start"
								)}
							>
								{icon?.length ? (
									<div
										className="flex items-center justify-center rounded-md"
										style={{ aspectRatio }}
										dangerouslySetInnerHTML={{
											__html: icon,
										}}
									/>
								) : (
									<div
										className="spotlight-grid-item-preview relative flex-shrink-0 bg-content/10 border border-stroke rounded-md overflow-hidden w-full"
										style={{ aspectRatio }}
									>
										{(image?.length || video?.length) && (
											<>
												{image == "placeholder" ? (
													<div className="h-full flex items-center justify-center">
														<svg
															className="size-8"
															viewBox="0 0 24 24"
															fill="none"
															strokeWidth={1.5}
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
															/>
														</svg>
													</div>
												) : (
													<img
														className={
															"absolute size-full object-cover pointer-events-none"
														}
														src={
															image?.length
																? image
																: video
														}
														alt=""
													/>
												)}
												{video?.length && (
													<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
														<div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-card">
															<div className="absolute inset-0 bg-content/60"></div>
															<svg
																className="w-4 ml-0.5 relative text-canvas"
																viewBox="0 0 24 24"
																fill="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
																/>
															</svg>
														</div>
													</div>
												)}
											</>
										)}
									</div>
								)}

								{!previewOnly && (
									<div
										className={clsx(
											"flex-1 min-w-0 space-y-1",
											icon?.length && "text-center"
										)}
									>
										{title?.length > 0 && (
											<h5 className="line-clamp-1 text-content text-sm/none font-medium first-letter:capitalize">
												{title}
											</h5>
										)}
										{subtitle?.toString().length > 0 && (
											<p
												className={clsx(
													"text-xs/none line-clamp-1",
													title?.length && "mt-1.5"
												)}
											>
												{subtitle}
											</p>
										)}
									</div>
								)}
							</div>
						);
					}}
				</SpotlightListItem>
			))}
		</div>
	);
}
