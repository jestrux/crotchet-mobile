import {
	objectToQueryParams,
	registerAction,
	registerApp,
	urlQueryParamsAsObject,
} from "@/crotchet";

import AudioPlayer from "./AudioPlayer";

registerAction("playAudio", {
	handler: (params, { openUrl }) =>
		openUrl(`crotchet://app/AudioPlayer?${objectToQueryParams(params)}`),
});

registerApp("AudioPlayer", () => {
	return {
		load(path, { openPage }) {
			const params = urlQueryParamsAsObject(path);

			return openPage({
				title: "Media Player",
				content: <AudioPlayer {...params} />,
			});
		},
	};
});
