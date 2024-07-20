import { Children, cloneElement } from "react";
import { useSourceGet } from ".";

export default function SourceGetter({ source, children }) {
	const { loading, data } = useSourceGet(source);

	if (loading || !data) return null;

	if (typeof children != "function") {
		return Children.map(children, (child) => {
			if (!child?.type) return null;

			return cloneElement(child, {
				isLoading: loading,
				data,
			});
		});
	}

	return children({
		isLoading: loading,
		data,
	});
}
