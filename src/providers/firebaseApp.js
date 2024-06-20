import { cleanObject, randomId } from "@/utils";
import { initializeApp } from "firebase/app";
import {
	Timestamp,
	addDoc,
	collection,
	collectionGroup,
	doc,
	getCountFromServer,
	getDoc,
	getDocs,
	getFirestore,
	orderBy,
	query,
	setDoc,
	where,
} from "firebase/firestore";
import {
	getStorage,
	ref,
	getDownloadURL,
	uploadString,
} from "firebase/storage";

// Cors for firebase storage
// https://stackoverflow.com/questions/71193348/firebase-storage-access-to-fetch-at-has-been-blocked-by-cors-policy-no-ac

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
	apiKey: import.meta.env.VITE_apiKey,
	authDomain: import.meta.env.VITE_authDomain,
	databaseURL: import.meta.env.VITE_databaseURL,
	projectId: import.meta.env.VITE_projectId,
	storageBucket: import.meta.env.VITE_storageBucket,
	messagingSenderId: import.meta.env.VITE_messagingSenderId,
	appId: import.meta.env.VITE_appId,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage();
export const getFileUrl = (url) => getDownloadURL(ref(storage, url));
export const getDbTables = async () => {
	const res = await getDocs(collectionGroup(db, "dbModel"));
	return res.docs.map((doc) => doc.ref.id);
};
export const queryDb = async (table, { orderBy: _orderBy, filter } = {}) => {
	if (filter && _.isObject(filter)) filter = _.first(Object.entries(filter));

	const params = [
		collection(db, "__db", table, "data"),
		...(filter
			? [where(filter[0], "==", filter[1]), orderBy(filter[0])]
			: []),
		...(_orderBy ? [orderBy(..._orderBy.split(","))] : []),
	];

	const res = await getDocs(query(...params));

	return res.docs.map((doc) => {
		return {
			_id: doc.ref.id,
			...doc.data(),
		};
	});
};

export const dbInsert = async (table, data, { rowId, merge = true } = {}) => {
	if (!_.isObject(data)) {
		data = {
			text: data,
		};
	}

	data = cleanObject({
		...((data ?? {}) || {}),
		createdAt: Timestamp.fromDate(new Date()),
		updatedAt: Timestamp.fromDate(new Date()),
	});

	rowId = rowId || data._rowId;

	const tablePath = ["__db", table, "data"];
	const modelRef = doc(db, "__db", table, "dbModel", table);
	getDoc(modelRef).then((doc) => {
		if (!doc.exists()) {
			setDoc(modelRef, {
				name: table,
			});
		}
	});
	const tableRef = collection(db, ...tablePath);
	let rowRef;

	if (rowId) {
		rowRef = doc(db, ...tablePath, rowId);
		await setDoc(rowRef, data, { merge });
	} else rowRef = await addDoc(tableRef, data);

	const res = await getDoc(rowRef);

	getCountFromServer(tableRef).then((snapshot) => {
		setDoc(rowRef, { _index: snapshot.data().count }, { merge: true });
	});

	return res;
};

export const dbUpdate = async (table, rowId, data, { merge = true } = {}) => {
	if (!_.isObject(data)) {
		data = {
			text: data,
		};
	}

	data.updatedAt = Timestamp.fromDate(new Date());

	const rowRef = doc(db, "__crotchet", "__db", table, rowId);

	await setDoc(rowRef, data, { merge });

	return await getDoc(rowRef);
};

export const uploadDataUrl = async (content) => {
	const { ref: fileRef } = await uploadString(
		ref(storage, "crotchet-uploads/file-" + randomId()),
		content,
		"data_url"
	);
	return await getDownloadURL(fileRef);
};
