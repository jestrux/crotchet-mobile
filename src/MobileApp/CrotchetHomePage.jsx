import { BottomNav } from "@/components/BottomNav";
import { useAppContext, usePrefsState } from "@/crotchet";
import { clsx } from "clsx";
import { useState } from "react";

const AppScreen = ({ scheme }) => {
	const { apps } = useAppContext();
	const App = apps?.[scheme]?.main;

	if (!App) {
		return (
			<div className="h-screen flex items-center justify-center">
				Unkown app {scheme}
			</div>
		);
	}

	return <App />;
};

const BottomNavPlaceholder = () => <div style={{ height: 60 }}>&nbsp;</div>;

export default function CrotchetHomePage() {
	const { bottomSheets } = useAppContext();
	const [currentPage, setCurrentPage] = useState("home");
	const [pinnedApps] = usePrefsState("pinnedApps");

	return (
		<div
			className="fixed inset-0 overflow-hidden"
			style={{
				paddingTop: "env(safe-area-inset-top)",
				paddingBottom: "env(safe-area-inset-bottom)",
			}}
		>
			<div className="pointer-events-none">
				<div
					className="dark:hidden bg-cover fixed inset-0 blur-xl"
					style={{
						"--tw-blur": "blur(380px)",
						backgroundImage: `url(img/light-wallpaper.jpg)`,
					}}
				></div>

				<div
					className="hidden dark:block bg-cover fixed inset-0 blur-xl"
					style={{
						"--tw-blur": "blur(150px)",
						backgroundImage: `url(img/dark-wallpaper.jpg)`,
					}}
				></div>

				<div
					className="fixed z-50 bg-canvas/5 inset-x-0 top-0 backdrop-blur-sm"
					style={{
						"--tw-backdrop-blur": "blur(1px)",
						height: "env(safe-area-inset-top)",
					}}
				></div>
			</div>

			{(pinnedApps || ["", "home", ""]).map((app, index) => (
				<div
					key={app + index}
					className={clsx("fixed inset-0 overflow-auto", {
						hidden: currentPage != app,
						// "opacity-0 pointer-events-none": currentPage != app,
					})}
				>
					<AppScreen scheme={app} />
					<BottomNavPlaceholder />
				</div>
			))}

			<div className="lg:hidden">
				<BottomNav
					{...{
						pinnedApps,
						currentPage,
						setCurrentPage,
					}}
					hidden={bottomSheets.length}
				/>
			</div>
		</div>
	);
}
