import { Children, cloneElement } from "react";
import { useDataFetch } from ".";
import { useAppContext } from "../app";
import Loader from "@/components/Loader";

export default function DataFetcher({
	children,
	source = {
		provider: "",
	},
	limit = 500,
	first,
	shuffle: shuffleData,
	contentOnly = false,
	showLoader = false,
	...props
}) {
	const appContext = useAppContext();
	const crotchetDataSource = appContext.dataSources?.[source?.name];
	source = {
		...(source?.provider == "crotchet" && crotchetDataSource
			? crotchetDataSource
			: {}),
		...source,
	};

	const { isLoading, isPending, data, refetch, shuffle } = useDataFetch({
		source,
		limit,
		first,
		shuffle: shuffleData,
		...props,
	});

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
				isLoading: isLoading || isPending,
				data,
				refetch,
				shuffle,
			});
		});
	}

	return children({
		fieldMap: source.fieldMap,
		isLoading: isLoading || isPending,
		data,
		refetch,
		shuffle,
	});
}
