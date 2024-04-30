import clsx from "clsx";

export default function PreviewCard({
	icon,
	image,
	title,
	subtitle,
	description,
}) {
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
				image?.length > 0 && (
					<div
						className="border border-content/10 flex-shrink-0 h-10 w-14 bg-content/5 rounded-md bg-cover bg-center"
						style={{
							backgroundImage: `url(${image})`,
						}}
					></div>
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
