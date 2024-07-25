import { Loader, useEffect, useRef, useSourceGet } from "@/crotchet";

export default function useLoadableView({
	data: _data,
	dismiss,
	delayLoader = false,
	onSuccess,
	onUpdate,
	listenForUpdates,
	pageData,
}) {
	const oldData = useRef(pageData);
	const { data, error, loading, refetch } = useSourceGet(
		async ({ fromRefetch } = {}) => {
			let res;
			try {
				res = _.isFunction(_data) ? await _data(pageData) : _data;

				if (fromRefetch) {
					if (_.isFunction(onUpdate)) onUpdate(res, oldData.current);
				} else if (_.isFunction(onSuccess)) onSuccess(res);

				oldData.current = res;
			} catch (error) {
				throw Error(error || "Unkown error!");
			}

			return res;
		},
		{ delayLoader }
	);

	const content = () => {
		if (!data && !loading && !error) return true;

		if (error) {
			const dismissible = typeof dismiss == "function";

			return (
				<div
					className="w-full"
					onClick={dismissible ? dismiss() : null}
				>
					<p>Something went wrong:</p>
					<div className="w-full overflow-auto">
						<div style={{ color: "red" }}>
							{JSON.stringify(error)}
						</div>
					</div>
					{dismissible && (
						<button type="button">Okay, go back</button>
					)}
				</div>
			);
		}

		if (loading) {
			return (
				<div className="flex justify-center">
					<Loader size={40} />
				</div>
			);
		}

		return true;
	};

	useEffect(() => {
		let clearUpdateWatcher;

		if (typeof listenForUpdates == "function")
			clearUpdateWatcher = listenForUpdates(() => refetch());

		return () => {
			if (typeof clearUpdateWatcher == "function") clearUpdateWatcher();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { data, loading, error, pendingView: content(), retry: refetch };
}
