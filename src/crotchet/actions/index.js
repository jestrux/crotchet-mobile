import * as defaultActions from "./defaultActions";
import * as defaultShareActions from "./defaultShareActions";
import { registerAction } from "@/crotchet";

Object.entries(defaultShareActions).forEach(([name, action]) =>
	registerAction(name, action)
);

Object.entries(defaultActions).forEach(([name, action]) => {
	registerAction(
		name,
		typeof action == "function" ? { global: true, handler: action } : action
	);
});
