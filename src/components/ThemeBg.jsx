import { forwardRef } from "react";
import useDataLoader from "../hooks/useDataLoader";

export default forwardRef(function ThemeBg(
	{ overlay = false, className, children, ...props },
	ref
) {
	const { data: appTheme } = useDataLoader({
		handler: () => window.__crotchet["crotchet-app-theme"] || {},
		listenForUpdates: "crotchet-app-theme-set",
	});
	const { tintColor } = appTheme || {};

	return (
		<>
			<div
				ref={ref}
				{...props}
				className={`bg-card/[0.985] relative ${className}`}
			>
				<div
					className="pointer-events-none absolute inset-0 opacity-10"
					style={{ background: tintColor }}
				></div>

				{overlay && (
					<div className="pointer-events-none absolute inset-0 bg-[--overlay-color]"></div>
				)}

				{children}
			</div>
		</>
	);
});
