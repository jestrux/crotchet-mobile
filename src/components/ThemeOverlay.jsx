export default function ThemeOverlay({ height }) {
	return (
		<div
			className="pointer-events-none fixed inset-0 bg-purple-700/10"
			style={
				height
					? {
							height,
							top: "auto",
					  }
					: {}
			}
		></div>
	);
}
