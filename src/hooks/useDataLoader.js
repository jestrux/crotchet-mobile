import { useSourceGet } from "@/crotchet";
import { useEffect } from "react";

export default function useDataLoader({
	handler,
	delayLoader = false,
	onSuccess = () => {},
	onUpdate = () => {},
	listenForUpdates,
} = {}) {
	const { data, error, loading, refetch } = useSourceGet(
		async ({ fromRefetch } = {}) => {
			let res;
			try {
				res = _.isFunction(handler)
					? await handler({ fromRefetch })
					: handler;

				if (!fromRefetch) onSuccess(res);
				else onUpdate(res);
			} catch (error) {
				throw Error(error || "Unkown error!");
			}

			return res;
		},
		{ delayLoader }
	);

	const listenForEvents = (events) => {
		if (!events?.length) return;

		events.forEach((event) =>
			window.addEventListener(event, refetch, false)
		);

		return () =>
			events.forEach((event) =>
				window.removeEventListener(event, refetch, false)
			);
	};

	useEffect(() => {
		let clearUpdateWatcher;

		if (typeof listenForUpdates == "function")
			clearUpdateWatcher = listenForUpdates(() => refetch());
		else if (
			typeof listenForUpdates == "string" ||
			_.isArray(listenForUpdates)
		)
			clearUpdateWatcher = listenForEvents(
				_.isArray(listenForUpdates)
					? listenForUpdates
					: [listenForUpdates]
			);

		return () => {
			if (typeof clearUpdateWatcher == "function") clearUpdateWatcher();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		data,
		loading,
		error,
		refetch,
	};
}
