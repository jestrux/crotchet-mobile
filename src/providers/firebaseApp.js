import { cleanObject, randomId } from "@/utils";
import { initializeApp } from "firebase/app";
import {
	Timestamp,
	addDoc,
	collection,
	collectionGroup,
	deleteDoc,
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
	uploadBytes,
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

const dbTablePath = (table) => ["__db", table, "data"];

const notifyListeners = (table) =>
	window.dispatchEvent(new CustomEvent(`firebase-table-updated:${table}`));

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage();
export const getFileUrl = (url) => getDownloadURL(ref(storage, url));
export const getDbTables = async () => {
	const res = await getDocs(collectionGroup(db, "dbModel"));
	return res.docs.map((doc) => doc.ref.id);
};
export const queryDb = async (
	table,
	{ rowId, orderBy: _orderBy = "updatedAt,desc", filter } = {}
) => {
	if (filter && _.isObject(filter)) filter = _.first(Object.entries(filter));

	const params = [
		collection(db, ...dbTablePath(table)),
		...(filter
			? [where(filter[0], "==", filter[1]), orderBy(filter[0])]
			: []),
		...(_orderBy ? [orderBy(..._orderBy.split(","))] : []),
	];

	const res = await getDocs(query(...params));

	const docs = res.docs.map((doc) => {
		const data = doc.data();
		data.createdAt = data.createdAt?.toDate?.()?.getTime();
		data.updatedAt = data.updatedAt?.toDate?.()?.getTime();

		return {
			_rowId: doc.ref.id,
			_id: doc.ref.id,
			...data,
		};
	});

	if (rowId?.length) return docs.find((doc) => doc._rowId == rowId);

	return docs;
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

	const tablePath = dbTablePath(table);
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

	notifyListeners(table);

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

	const rowRef = doc(db, ...dbTablePath(table), rowId);

	await setDoc(rowRef, _.omit(data, "createdAt"), { merge });

	notifyListeners(table);

	return await getDoc(rowRef);
};

export const dbDelete = async (table, rowId) => {
	await deleteDoc(doc(db, ...dbTablePath(table), rowId));
	notifyListeners(table);
	return;
};

export const uploadDataUrl = async (content) => {
	const { ref: fileRef } = await uploadString(
		ref(storage, "crotchet-uploads/file-" + randomId()),
		content,
		"data_url"
	);
	return await getDownloadURL(fileRef);
};

export const uploadStringAsFile = async (
	content,
	{ name = randomId() + ".txt", type = "text/plain" }
) => {
	const file = new Blob([content], {
		type,
	});

	console.log("File ref: ", "crotchet-uploads/file-" + name);

	const fileRef = ref(storage, "crotchet-uploads/file-" + name);

	var res = await uploadBytes(fileRef, file, { type });

	return await getDownloadURL(res.ref);

	// https://firebasestorage.googleapis.com/v0/b/letterplace-c103c.appspot.com/o/crotchet-uploads%2Ffile-ipf-os-app.json?alt=media&token=2b0672b7-279e-497c-8bb9-bf1f51520e4b
};
