import clsx from "clsx";

export default function PreviewCard({
	icon,
	image,
	video,
	title,
	subtitle,
	description,
	large = false,
}) {
	if (large) {
		return (
			<div
				className={clsx(
					"min-h-full w-full flex flex-col gap-2",
					icon?.length > 0 ? "items-center" : "items-start"
				)}
			>
				{icon?.length ? (
					<div
						className="flex items-center justify-center"
						dangerouslySetInnerHTML={{ __html: icon }}
					/>
				) : (
					<div className="relative flex-shrink-0 bg-content/10 border border-stroke rounded overflow-hidden w-full aspect-[16/9] max-h-40">
						{(image?.length || video?.length) && (
							<>
								<img
									className={
										"absolute size-full object-cover"
									}
									src={image?.length ? image : video}
									alt=""
								/>
								{video?.length && (
									<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
										<div className="relative w-12 h-12 flex items-center justify-center rounded-full overflow-hidden bg-card">
											<div className="absolute inset-0 bg-content/60"></div>
											<svg
												className="w-6 ml-0.5 relative text-canvas"
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

				<div
					className={clsx(
						"flex flex-col gap-1 flex-1 min-w-0 space-y-1 px-2 pt-1 pb-3.5",
						icon?.length && "text-center"
					)}
				>
					{title?.length > 0 && (
						<h5 className="text-base/none line-clamp-1 font-semibold first-letter:capitalize">
							{title}
						</h5>
					)}
					{subtitle?.toString().length > 0 && (
						<p className="text-base/none line-clamp-1 opacity-70">
							{subtitle}
						</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			{icon?.length ? (
				<div className="-mr-0.5 bg-content/5 border border-content/5 rounded-lg size-10 flex items-center justify-center">
					<div
						className="size-5 flex items-center justify-center"
						dangerouslySetInnerHTML={{ __html: icon }}
					></div>
				</div>
			) : (
				(video || image)?.length > 0 && (
					<div
						className="border border-content/10 flex-shrink-0 h-10 w-14 bg-content/5 rounded-md bg-cover bg-center relative"
						style={{
							backgroundImage: `url(${video || image})`,
						}}
					>
						{video && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/30 dark:bg-black/50">
								<div className="relative size-6 bg-card flex items-center justify-center rounded-full overflow-hidden">
									<div className="absolute inset-0 bg-content/70"></div>
									<svg
										className="size-3.5 ml-0.5 relative text-canvas"
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
					</div>
				)
			)}

			<div className="flex-1">
				{title?.length > 0 && (
					<h3
						className="text-sm text-content line-clamp-1"
						dangerouslySetInnerHTML={{ __html: title }}
					></h3>
				)}

				<p
					className={clsx(
						"text-content/50",
						title?.length > 0
							? "text-xs line-clamp-1"
							: "text-xs/relaxed line-clamp-2"
					)}
					dangerouslySetInnerHTML={{
						__html: description || subtitle,
					}}
				></p>
			</div>
		</div>
	);
}
