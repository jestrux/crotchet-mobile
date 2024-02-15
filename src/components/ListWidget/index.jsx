import { useEffect } from "react";

import { useAirtableFetch } from "@/providers/airtable/useAirtable";
// import useLocalStorageState from "@/hooks/useLocalStorageState";

import Loader from "@/components/Loader";
import Widget from "@/components/Widget";

import ListItem from "./ListItem";

const ListWidget = ({
	// cacheData = false,
	// page,
	table,
	filters,
	orderBy,
	limit,
	widgetProps,
	children,
	noPadding = true,
	...props
}) => {
	if (widgetProps === undefined) widgetProps = { noPadding };

	// const [data, setData] = useState(null);
	// const [data, setData] = useLocalStorageState(
	// 	!cacheData ? null : `${page ?? ""} ${widgetProps?.title || table}`
	// );
	const { isLoading, refetch, data } = useAirtableFetch({
		table,
		filters,
		orderBy,
		limit,
		refetchOnWindowFocus: false,
		// onSuccess: (res) => {
		// 	// if (table == "announcements")
		// 	setData(res);
		// },
	});

	useEffect(() => {
		document.addEventListener("widgets-updated", refetch, false);

		return () => {
			document.removeEventListener("widgets-updated", refetch, false);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Widget {...widgetProps} refresh={refetch}>
			{!data?.length && isLoading ? (
				<div className="relative h-8">
					<Loader scrimColor="transparent" size={25} />
				</div>
			) : (
				<div className="pb-2">
					{data &&
						data.map((entry, index) => {
							return typeof children == "function" ? (
								children(entry)
							) : (
								<ListItem
									key={index}
									data={entry}
									table={table}
									{...props}
								/>
							);
						})}
				</div>
			)}
		</Widget>
	);
};

export default ListWidget;
