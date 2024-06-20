import { Children, cloneElement, useEffect, useRef } from "react";
import { useDataFetch } from ".";
import Loader from "@/components/Loader";

export default function DataFetcher({
	children,
	source = {
		provider: "",
	},
	searchQuery,
	filters,
	limit = 3000,
	first,
	shuffle: shuffleData,
	contentOnly = false,
	showLoader = false,
	...props
}) {
	const initialized = useRef(false);
	const { isLoading, isPending, data, refetch, shuffle } = useDataFetch({
		source,
		searchQuery,
		filters,
		limit,
		first,
		shuffle: shuffleData,
		...props,
	});

	useEffect(() => {
		if (!initialized.current) initialized.current = true;
		else refetch({ searchQuery, filters });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, filters]);

	useEffect(() => {
		let clearUpdateWatcher;

		if (typeof source.listenForUpdates == "function") {
			clearUpdateWatcher = source.listenForUpdates(() =>
				refetch({ searchQuery, filters })
			);
		}

		return () => {
			if (typeof clearUpdateWatcher == "function") clearUpdateWatcher();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (contentOnly) {
		if (isLoading && showLoader) {
			return (
				<div className="relative h-8 min-w-full min-h-full flex items-center justify-center">
					<Loader scrimColor="transparent" size={25} />
				</div>
			);
		}

		if (!data) return null;
	}

	if (typeof children != "function") {
		return Children.map(children, (child) => {
			if (!child?.type) return null;

			return cloneElement(child, {
				fieldMap: source.fieldMap,
				isLoading: !contentOnly && (isLoading || isPending),
				data,
				refetch,
				shuffle,
			});
		});
	}

	return children({
		fieldMap: source.fieldMap,
		isLoading: !contentOnly && (isLoading || isPending),
		data,
		refetch,
		shuffle,
	});
}
