import * as defaultActions from "./defaultActions";
import { registerAction } from "@/crotchet";

Object.entries(defaultActions).forEach(([name, handler]) => {
	registerAction(name, { global: true, handler });
});
