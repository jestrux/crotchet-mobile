import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from ".";
import { randomId } from "@/utils";
import { useRef } from "react";

export default function useFirebase({
	collection: collectionName,
	orderBy: _orderBy,
	// limit,
}) {
	const ref = useRef(randomId());
	const { isLoading, refetch, data, error } = useQuery({
		queryKey: [ref.current],
		queryFn: async () => {
			var params = [
				collection(db, collectionName),
				// ...(groupFilter
				// 	? [where("group", "==", groupFilter), orderBy("group")]
				// 	: []),
				...(_orderBy ? [orderBy(..._orderBy.split(","))] : []),
			];

			var res = await getDocs(query(...params));

			const docs = res.docs.map((doc) => {
				return {
					_id: doc.ref,
					...doc.data(),
				};
			});

			return docs;
		},
	});

	return {
		isLoading,
		refetch,
		data,
		error,
	};
}
