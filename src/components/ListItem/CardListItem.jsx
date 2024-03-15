import clsx from "clsx";

import { useState } from "react";
import { openUrl, Loader } from "@/crotchet";

export default function CardListItem({
	grid,
	icon,
	image,
	video,
	url,
	title,
	subtitle,
	trailing,
	onClick,
}) {
	const [actionLoading, setActionLoading] = useState(false);
	const handleClick = async () => {
		const clickHandlerSet = typeof onClick == "function";

		setActionLoading(true);

		try {
			if (clickHandlerSet) await Promise.resolve(onClick());
			else if (url) await Promise.resolve(openUrl(url));
		} catch (error) {
			//
		}

		setActionLoading(false);
	};

	const content = () => {
		return (
			<>
				{icon?.length ? (
					<div
						className="mr-2.5"
						dangerouslySetInnerHTML={{ __html: icon }}
					/>
				) : (
					(image?.length || video?.length) && (
						<div className="relative mr-2.5 flex-shrink-0 bg-content/10 border border-content/10 rounded overflow-hidden w-16 aspect-[2/1.5]">
							<img
								className={"absolute size-full object-cover"}
								src={image?.length ? image : video}
								alt=""
							/>

							{video?.length && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden">
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
						</div>
					)
				)}

				<div className="flex-1 mr-3 min-w-0 space-y-2">
					{title?.length > 0 && (
						<h5 className="text-content text-sm/none font-medium line-clamp-1 first-letter:capitalize">
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

				<div className="self-stretch flex-shrink-0 ml-auto flex items-center gap-2">
					{trailing?.toString().length > 0 && (
						<span className="text-sm opacity-60">{trailing}</span>
					)}
				</div>
			</>
		);
	};

	return (
		<a
			onClick={handleClick}
			className={clsx(
				"lg:group w-full text-left flex items-center relative",
				!grid && "py-2"
			)}
		>
			{content()}

			{actionLoading && (
				<div className="absolute right-0 inset-y-0 p-1 backdrop-blur-sm">
					<Loader className="opacity-50" size={20} />
				</div>
			)}
		</a>
	);
}
