import { registerApp } from "@/crotchet";
import Widgets from "./Widgets";
// import Automate from "./Automate/Automate";

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
					d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
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
					{/* <Automate
						action="readDbTable"
						dismiss={() => {}}
						maxHeight={window.innerHeight}
					/> */}
				</div>
			);
		},
	};
});
