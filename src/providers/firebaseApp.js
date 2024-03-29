import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

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
