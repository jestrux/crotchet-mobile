import { useState, useEffect, useAppContext, clsx } from "@/crotchet";
import useEventListener from "@/hooks/useEventListener";
import useLoadableView from "@/hooks/useLoadableView";

export default function RemoteApp() {
	const { remoteActions, remoteApps, socket } = useAppContext();
	const [apps, setApps] = useState([]);
	const {
		pendingView,
		data: socketConnected,
		retry,
		loading,
	} = useLoadableView({
		data: () => socket({ retry: true }),
	});

	useEventListener("toggle-remote-app", (_, newApp) => {
		setApps((apps) => {
			return apps.includes(newApp)
				? apps.filter((app) => app != newApp)
				: [...apps, newApp];
		});
	});

	useEffect(() => {
		return () => {
			apps.forEach((appName) => {
				const app = remoteApps[appName];
				if (typeof app.onClose == "function")
					app.onClose(window.__crotchet);
			});
		};
	});

	const allActions = Object.keys(remoteActions);
	const actions = allActions.filter(
		(actionName) => !apps.includes(actionName)
	);

	if (loading) return <div className="px-4 py-12">{pendingView}</div>;

	if (!socketConnected)
		return (
			<div className="px-4 py-12 flex flex-col items-center justify-center gap-4">
				Socket not connected!
				<button onClick={retry}>Retry</button>
			</div>
		);

	const activeApps = apps.length ? apps : ["defaultRemoteApp"];

	return (
		<>
			<div className="rounded-t-2xl relative z-10 flex-shrink-0 h-10 flex items-center bg-content/5">
				<span className="ml-5 flex-1 capitalize tracking-tight text-sm font-semibold opacity-80">
					Control Desktop
				</span>

				{actions.map((actionName, index) => {
					const action = remoteActions[actionName];
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
							{content}
						</button>
					);
				})}
			</div>

			<div className="space-y-5">
				{activeApps.map((appName) => {
					const app = remoteApps[appName];
					const Content = app?.main;
					const isDefaultApp = appName == "defaultRemoteApp";

					if (isDefaultApp) return Content ? <Content /> : null;

					let appAction = allActions.find((name) => name == appName);
					if (appAction) appAction = remoteActions[appAction];

					return (
						<div
							key={app._id}
							className="mt-4 mx-3 border-2 border-content/10 rounded-2xl"
						>
							<div className="pl-5 rounded-t-2xl relative z-10 flex-shrink-0 h-10 flex items-center gap-3 bg-content/5">
								{app?.icon}

								<span className="flex-1 capitalize tracking-tight text-sm font-semibold opacity-80">
									{app.name}
								</span>

								<button
									className="relative h-10 w-14 flex items-center justify-center"
									onClick={() => {
										if (typeof app.onClose == "function")
											app.onClose(window.__crotchet);

										setApps((apps) =>
											apps.filter(
												(name) => name != appName
											)
										);
									}}
								>
									<svg
										className="size-4"
										viewBox="0 0 24 24"
										fill="none"
										strokeWidth={2}
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18 18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{Content && <Content />}
						</div>
					);
				})}
			</div>
		</>
	);
}
