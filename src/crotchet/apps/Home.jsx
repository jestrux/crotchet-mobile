import { registerApp } from "@/crotchet";
import Widgets from "./Widgets";

registerApp("home", () => {
	return {
		icon: (
			<svg
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.8}
				stroke="currentColor"
				className="h-5"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
				/>
			</svg>
		),
		name: "Home Screen",
		main: function LaCroix() {
			return (
				<div
					style={{
						paddingTop: "env(safe-area-inset-top)",
						paddingBottom: "env(safe-area-inset-bottom)",
					}}
				>
					<Widgets />
				</div>
			);
		},
	};
});
