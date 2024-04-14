import { useEffect, useState } from "react";

export default function useEventListener(event) {
	const [state, setState] = useState({
		data: null,
		last: Date.now(),
	});

	const handler = function (e) {
		setState({
			data: e.detail,
			last: Date.now(),
		});
	};

	useEffect(() => {
		window.addEventListener(event, handler, false);

		return () => window.removeEventListener(event, handler, false);
	});

	return state;
}
