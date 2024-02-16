import { randomId } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export const webFetcher = ({
	url,
	body = {},
	bearerToken,
	responseType = "json",
	responseField,
}) => {
	const fetchHeaders = {
		Accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${bearerToken}`,
	};

	let fullUrl = new URL(url);
	try {
		Object.entries(body).forEach(([key, value]) =>
			fullUrl.searchParams.append(key, value)
		);
	} catch (error) {
		console.log("Error: ", error);
	}

	return fetch(fullUrl.href, {
		headers: fetchHeaders,
	})
		.then((response) => response[responseType]())
		.then((res) => res?.[responseField] || res);
};

export default function useWeb({
	url,
	body = {},
	bearerToken,
	responseType = "json",
	responseField,
}) {
	const ref = useRef(randomId());

	const { isLoading, refetch, data, error } = useQuery({
		queryKey: [ref.current],
		queryFn: () =>
			webFetcher({
				url,
				body,
				bearerToken,
				responseType,
				responseField,
			}),
	});

	return {
		isLoading,
		refetch,
		data,
		error,
	};
}
