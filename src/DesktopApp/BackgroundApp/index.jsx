import { dispatch } from "@/utils";
import Confetti from "./Confetti";
import useEventListener from "@/hooks/useEventListener";

export default function BackgroundApp() {
	const hideBackgroundApp = () => {
		dispatch("toggle-background-app", false);
	};

	useEventListener("socket", (_, { event, payload } = {}) => {
		if (event == "background-action") {
			const { action, ...actionProps } = payload || {};

			if (action == "confetti") {
				const { effect = "Center Flowers", options = {} } = actionProps;

				window
					.playConfetti({
						effect,
						options,
					})
					.then(() => {
						hideBackgroundApp();
					});

				return;
			}

			return;
		}
	});

	return <Confetti />;
}
