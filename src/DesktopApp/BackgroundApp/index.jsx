import { dispatch } from "@/utils";
import useEventListener from "@/hooks/useEventListener";
import { useAppContext } from "@/crotchet";

export default function BackgroundApp() {
	const { backgroundApps, backgroundActions } = useAppContext();
	const hideBackgroundApp = () => {
		dispatch("toggle-background-app", false);
	};

	const cleanup = () => {
		hideBackgroundApp();
	};

	useEventListener("socket", async (_, { event, payload } = {}) => {
		if (event == "background-action") {
			const { action: actionName, ...actionProps } = payload || {};
			const action = backgroundActions[actionName];

			if (action?.handler) await action.handler(actionProps);

			cleanup();

			return;
		}
	});

	return (
		<>
			{Object.keys(backgroundApps).map((scheme) => {
				const App = backgroundApps?.[scheme]?.main;

				if (!App) return null;

				return <App key={scheme} />;
			})}
		</>
	);
}
