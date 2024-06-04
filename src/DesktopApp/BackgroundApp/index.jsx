import { dispatch, randomId } from "@/utils";
import useEventListener from "@/hooks/useEventListener";
import { useAppContext, useRef, useState } from "@/crotchet";

export default function BackgroundApp() {
	const toastTimerRef = useRef();
	const [toasts, setToasts] = useState(null);

	const { backgroundApps, backgroundActions } = useAppContext();
	const hideBackgroundWindow = () => {
		dispatch("toggle-background-window", false);
	};

	const cleanup = () => {
		if (window.__crotchetBackgroundAppCleaner)
			clearTimeout(window.__crotchetBackgroundAppCleaner);

		window.__crotchetBackgroundAppCleaner = setTimeout(() => {
			if (!window.__crotchet.visibleBackgroundApps?.length) {
				console.log("Closing up background window...");
				hideBackgroundWindow();
			}
		}, 400);
	};

	useEventListener("socket", async (_, { event, payload } = {}) => {
		if (event == "background-action") {
			const { _action: actionName, ...actionProps } = payload || {};

			let action;

			if (actionName == "toggle-app") {
				const appName = actionProps.app;
				const newValue = actionProps.value;

				if (appName && backgroundApps[appName]) {
					const visibleApps = window.__crotchet.visibleBackgroundApps;
					const exists = visibleApps.includes(appName);

					if (!exists && newValue === false) return;

					window.__crotchet.visibleBackgroundApps = exists
						? visibleApps.filter((app) => app != appName)
						: [...visibleApps, appName];
				}

				return;
			} else if (actionName == "toast")
				action = { handler: () => showToast(actionProps.message) };
			else if (actionName == "log")
				action = { handler: () => console.log(actionProps.message) };
			else action = backgroundActions[actionName];

			if (action?.handler) await action.handler(actionProps);

			cleanup();

			return;
		}
	});

	const showToast = (message) => {
		return new Promise((resolve) => {
			if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

			setToasts([{ _id: randomId(), message }]);

			toastTimerRef.current = setTimeout(() => {
				setToasts([]);
				resolve();
			}, 2000);
		});
	};

	return (
		<>
			{Object.keys(backgroundApps).map((scheme) => {
				const App = backgroundApps?.[scheme]?.main;

				if (!App) return null;

				return (
					<div
						key={scheme}
						style={{ position: "fixed", zIndex: App.zIndex }}
					>
						<App />
					</div>
				);
			})}

			{toasts && (
				<div
					className="pointer-events-none fixed inset-x-0 bottom-32 flex flex-col gap-6 items-center z-50"
					style={{ zIndex: 9999 }}
				>
					{toasts.map((toast) => (
						<div
							key={toast._id}
							className="inline-flex items-center h-8 px-3.5 z-50 bg-content/80 text-canvas text-sm drop-shadow-sm rounded-full"
						>
							{toast.message}
						</div>
					))}
				</div>
			)}
		</>
	);
}
