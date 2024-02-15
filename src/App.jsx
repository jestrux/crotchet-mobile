import { BottomNav } from "@/components/BottomNav";
import { useAppContext } from "@/providers/app";

import Widgets from "@/apps/Widgets";
import Reader from "@/apps/Reader";

const App = () => {
	const { currentPage } = useAppContext();

	return (
		<div
			className="h-[100dvh] overflow-auto relative"
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

			<div className="relative">
				{currentPage == "home" && <Widgets />}
				{currentPage == "reader" && <Reader />}
			</div>

			<BottomNav />
		</div>
	);
};

export default App;
