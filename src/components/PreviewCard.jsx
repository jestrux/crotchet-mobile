import clsx from "clsx";

export default function PreviewCard({ image, title, description }) {
	return (
		<div className="flex items-center gap-3">
			{image?.length > 0 && (
				<div
					className="border border-content/10 flex-shrink-0 h-10 w-14 bg-content/5 rounded-md bg-cover bg-center"
					style={{
						backgroundImage: `url(${image})`,
					}}
				></div>
			)}

			<div className="flex-1">
				{title?.length > 0 && (
					<h3 className="text-sm text-content line-clamp-1">
						{title}
					</h3>
				)}

				<p
					className={clsx(
						"text-content/50",
						title?.length > 0
							? "text-xs line-clamp-1"
							: "text-xs/relaxed line-clamp-2"
					)}
				>
					{description}
				</p>
			</div>
		</div>
	);
}
