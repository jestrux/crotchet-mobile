import clsx from "clsx";
import DataWidget from "../DataWidget";
import WidgetWrapper from "../WidgetWrapper";
import DataFetcher from "@/providers/data/DataFetcher";
import { getGradient, openUrl } from "@/utils";
import { useAppContext } from "@/providers/app";

export default function GenericPage({
	image,
	gradient,
	title,
	subtitle,
	source,
	content = [],
	fullHeight,
	maxHeight,
	collapse,
}) {
	const { dataSources } = useAppContext();
	const headingSet = image || title || subtitle;

	return (
		<div
			className="relative px-6 py-10"
			style={
				fullHeight
					? {
							height: maxHeight + "px",
							overflow: "auto",
							borderTopLeftRadius: 32,
							borderTopRightRadius: 32,
					  }
					: {}
			}
		>
			<div
				className="fixed top-5 right-5 z-10"
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

			{headingSet && (
				<div
					className={clsx(
						"pb-2 border-content/10 overflow-hidden flex flex-col",
						image && "-mt-10 -mx-6"
					)}
				>
					{image && (
						<div
							className="mb-4 bg-content/5 relative"
							style={{
								aspectRatio:
									image == "gradient" ? "2/0.3" : "2/0.5",
								background:
									image == "gradient"
										? getGradient(gradient)
										: "",
							}}
						>
							{image == "gradient" ? null : [
									true,
									"random",
							  ].includes(image) ? (
								<DataFetcher
									source={dataSources.unsplash}
									first
									shuffle
									contentOnly
								>
									{({ data }) => (
										<img
											className="absolute inset-0 size-full object-cover"
											src={data.urls.regular}
										/>
									)}
								</DataFetcher>
							) : (
								<img
									className="absolute inset-0 size-full object-cover"
									src={image}
								/>
							)}
						</div>
					)}

					<div className={`${image && "px-6"}`}>
						{title && (
							<h3 className="text-lg font-bold first-letter:uppercase">
								{title}
							</h3>
						)}

						{subtitle && (
							<p
								className="mb-2 text-sm text-content/80 max-lines"
								style={{
									"--max-lines": 3,
								}}
							>
								{subtitle}
							</p>
						)}
					</div>
				</div>
			)}

			<div className="flex flex-col gap-4">
				{source ? (
					<DataWidget
						large
						source={source}
						{...source}
						widgetProps={{ noPadding: true }}
					/>
				) : (
					content &&
					content.map(
						// eslint-disable-next-line no-unused-vars
						({ type, title, subtitle, ...section }, index) => {
							const isImage = type == "image";
							const isVideo = type == "video";
							let content;
							const cropped = section.cropped ?? true;
							const aspectRatio =
								cropped || isVideo ? "16/9" : "";

							if (isImage || isVideo) {
								content = (
									<div
										className={clsx(
											"relative bg-content/5 border-4 border-content/10 rounded-md overflow-hidden",
											index == 0 && headingSet && "mt-2"
										)}
										style={{
											aspectRatio,
										}}
									>
										<img
											className={clsx(
												"object-cover rounded",
												cropped &&
													"absolute inset-0 size-full"
											)}
											src={section.value}
											style={{
												aspectRatio,
											}}
										/>

										{isVideo && section.url && (
											<a
												onClick={() =>
													openUrl(section.url)
												}
												className="absolute inset-0 bg-black/50 flex items-center justify-center"
											>
												<div className="relative w-12 h-12 flex items-center justify-center rounded-full overflow-hidden bg-card">
													<div className="absolute inset-0 bg-white text-black"></div>
													<svg
														className="w-7 ml-0.5 relative text-black"
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
											</a>
										)}
									</div>
								);
							} else if (type == "data") {
								content =
									section.wrapped ?? true ? (
										<WidgetWrapper>
											<DataWidget large {...section} />
										</WidgetWrapper>
									) : (
										<DataWidget
											large
											{...section}
											widgetProps={{ noPadding: true }}
										/>
									);
							} else {
								content = (
									<div className="text-base/loose">
										{section.value}
									</div>
								);
							}

							return (
								<div key={index}>
									{(title || subtitle) && (
										<div
											className={clsx(
												"space-y-1",
												["image", "video"].includes(
													type
												)
													? "mb-3"
													: "mb-1"
											)}
										>
											{title && (
												<h5 className="text-base font-bold first-letter:uppercase">
													{title}
												</h5>
											)}

											{subtitle && (
												<p className="text-sm text-content/80">
													{subtitle}
												</p>
											)}
										</div>
									)}

									{content}
								</div>
							);
						}
					)
				)}
			</div>
		</div>
	);
}
