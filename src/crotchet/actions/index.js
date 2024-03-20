import * as defaultActions from "./defaultActions";
import { registerAction } from "@/crotchet";

Object.entries(defaultActions).forEach(([name, action]) => {
	registerAction(
		name,
		typeof action == "function" ? { global: true, handler: action } : action
	);
});
