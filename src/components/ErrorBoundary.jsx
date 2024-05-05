import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

function fallbackRender({ error, resetErrorBoundary }) {
	return (
		<div role="alert" className="pointer-events-auto text-content z-[999]">
			<p>Something went wrong:</p>
			<div className="w-full overflow-auto">
				<pre style={{ color: "red" }}>{error.message}</pre>
			</div>
			<button type="button" onClick={resetErrorBoundary}>
				Okay, go back
			</button>
		</div>
	);
}

export default function ErrorBoundary({ children, onReset = () => {} }) {
	return (
		<ReactErrorBoundary fallbackRender={fallbackRender} onReset={onReset}>
			{children}
		</ReactErrorBoundary>
	);
}
