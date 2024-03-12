import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

import "./init";

import "./crotchet/dataSources";

import "./crotchet/actions";

import "./crotchet/apps";

import AppProvider from "./providers/app";
import App from "./App";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
	<QueryClientProvider client={queryClient}>
		<AppProvider>
			<App />
		</AppProvider>
	</QueryClientProvider>
);
