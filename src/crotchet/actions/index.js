import * as defaultActions from "./defaultActions";
import { registerAction } from "@/crotchet";

Object.entries(defaultActions).forEach(([name, action]) => {
	registerAction("crotchet", name, action);
});
