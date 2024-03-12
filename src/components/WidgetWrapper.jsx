import clsx from "clsx";

export default function WidgetWrapper({
	children,
	widget: Widget,
	width,
	aspectRatio,
	flex,
	columnSpan = 2,
	className = "",
}) {
	return (
		<div
			className={clsx(
				"rounded-2xl bg-card shadow-md border border-content/10 overflow-y-hidden relative",
				className
			)}
			style={{
				width,
				flex,
				gridColumn: `span ${columnSpan} / span ${columnSpan}`,
				aspectRatio,
				...(aspectRatio === undefined
					? {
							maxHeight: 350,
					  }
					: { maxHeight: 600 }),
			}}
		>
			<div className="h-full">
				{children ? children : Widget ? <Widget /> : <span></span>}
			</div>
		</div>
	);
}
