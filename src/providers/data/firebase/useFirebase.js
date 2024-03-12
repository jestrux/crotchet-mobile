import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db } from ".";
import { randomId } from "@/utils";
import { useRef } from "react";
import { storage } from "@/providers/firebaseApp";

export const firebaseUploadFile = async ({
	name = "_some_.txt",
	file = new Blob(["Sample text"], { type: "text/plain" }),
}) => {
	return uploadBytes(ref(storage, name), file);
};

export const firebaseFetcher = async ({
	collection: collectionName,
	orderBy: _orderBy,
}) => {
	const params = [
		collection(db, collectionName),
		// ...(groupFilter
		// 	? [where("group", "==", groupFilter), orderBy("group")]
		// 	: []),
		...(_orderBy ? [orderBy(..._orderBy.split(","))] : []),
	];
	const res = await getDocs(query(...params));

	var data = res.docs.map((doc) => {
		var item = {
			_id: doc.ref.id,
			...doc.data(),
		};

		return item;
	});

	return data;
};

export default function useFirebase({ collection, orderBy }) {
	const ref = useRef(randomId());
	const { isLoading, refetch, data, error } = useQuery({
		queryKey: [ref.current],
		queryFn: () => firebaseFetcher({ collection, orderBy }),
	});

	return {
		isLoading,
		refetch,
		data,
		error,
	};
}
