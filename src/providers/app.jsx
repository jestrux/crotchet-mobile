import { Preferences } from "@capacitor/preferences";
import { createContext, useContext, useEffect, useState } from "react";
const STORE_KEY = "crotchet-app";

const AppContext = createContext({
	prefs: {},
	currentPage: "home",
	// eslint-disable-next-line no-unused-vars
	setCurrentPage: (page) => {},
	// eslint-disable-next-line no-unused-vars
	setPref: (key, value) => {},
	user: {
		name: "Walter Kimaro",
		email: "wakyj07@gmail.com",
		preferences: {
			wallpaper: false,
			simpleGrid: true,
		},
	},
});

export const useAppContext = () => {
	return useContext(AppContext);
};

export default function AppProvider({ children }) {
	const [prefs, setPrefs] = useState();

	useEffect(() => {
		if (!prefs) {
			Preferences.get({ key: "app" }).then(({ value }) => {
				try {
					setPrefs(JSON.parse(value ?? "{}"));
				} catch (error) {
					setPrefs({});
				}
			});
		}
	}, []);

	const setPref = (key, value) => {
		setPrefs((prefs) => {
			const newPrefs = { ...prefs, [key]: value };
			Preferences.set({
				key: STORE_KEY,
				value: JSON.stringify(newPrefs),
			});
			return newPrefs;
		});
	};

	if (!prefs) return null;

	return (
		<AppContext.Provider
			value={{
				prefs,
				setPref,
				currentPage: prefs.currentPage ?? "home",
				setCurrentPage: (page) => setPref("currentPage", page),
				user: {
					name: "Walter Kimaro",
					email: "wakyj07@gmail.com",
					preferences: {
						wallpaper: false,
						simpleGrid: false,
					},
				},
			}}
		>
			{children}
		</AppContext.Provider>
	);
}
