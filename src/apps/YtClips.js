import { copyToClipboard, registerApp, showToast, onDesktop } from "@/crotchet";

registerApp("yt-clips", () => {
	return async (event = {}, { socketEmit }) => {
		try {
			const slug = event.url.split("yt-clips").pop();
			const url = new URL(event.url);

			if (slug && url.pathname?.length) {
				const params = url.searchParams;
				const id = params.get("id") || params.get("_id");
				const [start] = params.get("crop").split(",");

				copyToClipboard(event.url);

				const videoUrl = `https://www.youtube.com/watch?v=${id}&t=${start}s`;

				if (onDesktop()) {
					return window.open(videoUrl, "_blank");
				}

				return socketEmit("app", { url: videoUrl });
			}

			showToast("Yt Clips: Invalid data");
		} catch (error) {
			alert("Yt Clips: error: " + error);
		}
	};
});
