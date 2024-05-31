import { useState, useAppContext } from "@/crotchet";
import useEventListener from "@/hooks/useEventListener";
import useLoadableView from "@/hooks/useLoadableView";
import clsx from "clsx";

export default function RemoteApp() {
	const { remoteActions, remoteApps, socket } = useAppContext();
	const [currentApp, setCurrentApp] = useState();
	const {
		pendingView,
		data: socketConnected,
		retry,
		loading,
	} = useLoadableView({
		data: () => socket({ retry: true }),
		// dismiss,
	});

	useEventListener("toggle-remote-app", (_, app) => {
		setCurrentApp(currentApp == app ? null : app);
	});

	const activeApp = remoteApps?.[currentApp] ?? remoteApps.defaultRemoteApp;
	const Content = activeApp?.main;

	const actions = Object.keys(remoteActions);

	return (
		<div>
			<div className="rounded-t-2xl relative z-10 flex-shrink-0 h-10 flex items-center bg-content/5">
				<span
					className="ml-5 flex-1 capitalize tracking-tight text-sm font-semibold opacity-80"
					onClick={() => setCurrentApp(null)}
				>
					{activeApp?.name}
				</span>

				{socketConnected &&
					actions.map((actionName, index) => {
						const action = remoteActions[actionName];
						const active = currentApp == action.name;
						const content = action.icon || action.name;
						const isLast = index == actions.length - 1;

						return (
							<button
								key={action.name + index}
								className={clsx(
									"relative h-10 flex items-center justify-center",
									isLast ? "w-14" : "w-10"
								)}
								onClick={action.handler}
							>
								<div
									className={clsx(
										"absolute inset-0 bg-content/5 transition duration-150",
										{
											"opacity-0 scale-90 translate-x-1/3":
												!active,
										},
										isLast
											? "rounded-l-full origin-right"
											: "rounded-full origin-center"
									)}
								></div>

								{content}
							</button>
						);
					})}
			</div>

			{loading ? (
				<div className="px-4 py-12">{pendingView}</div>
			) : !socketConnected ? (
				<div className="px-4 py-12 flex flex-col items-center justify-center gap-4">
					Socket not connected!
					<button onClick={retry}>Retry</button>
				</div>
			) : (
				Content && <Content />
			)}
		</div>
	);
}
