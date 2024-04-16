import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import lodash from "lodash";

// import "./index.css";

import "./init";

import "./crotchet/dataSources";

import "./crotchet/action-sheets";

import "./crotchet/actions";

import "./crotchet/apps";

import "./crotchet/automations";

import AppProvider from "./providers/app";
import App from "./App";

window._ = lodash;

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
	<QueryClientProvider client={queryClient}>
		<AppProvider>
			<App />
		</AppProvider>
	</QueryClientProvider>
);
