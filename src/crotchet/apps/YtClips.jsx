import { registerApp } from "@/crotchet";
import { useEffect, useRef } from "react";
import YouTubePlayer from "youtube-player";
import PlayerStates from "youtube-player/dist/constants/PlayerStates";

registerApp("yt-clips", () => {
	return {
		load(path, { socket }) {
			if (typeof socket == "function" && socket().connected) {
				window.__crotchet.socketEmit("app", {
					scheme: "yt-clips",
					url: path,
					window: {
						width: 1280,
						height: 800,
						backgroundColor: "#000000",
						titleBarStyle: "hiddenInset",
						darkTheme: true,
					},
				});

				return;
			}

			const url = new URL("https://" + path);
			const params = url.searchParams;
			const id = params.get("id") || params.get("_id");
			const [start] = params.get("crop").split(",");

			window.open(
				`https://www.youtube.com/watch?v=${id}&t=${start}s`,
				"_blank"
			);
		},
		open: function Open({ _id, crop, duration, ...props }) {
			const videoId = _id || props.id;
			const [start, end] = (crop || `0,${duration}`)
				.split(",")
				.map(Number);

			const player = useRef(YouTubePlayer());

			const onPlayerReady = () => {
				player.current.on("stateChange", (e) => {
					if (e.data == PlayerStates.ENDED) {
						player.current.seekTo(start);
						player.current.playVideo();
					}
				});
			};

			useEffect(() => {
				initPlayer();
			}, []);

			function initPlayer() {
				player.current = YouTubePlayer("youtube-player", {
					height: window.innerHeight,
					width: window.innerWidth,
					playerVars: {
						autoplay: 1,
						start,
						end,
					},
				});

				player.current
					.loadVideoById({
						videoId,
						startSeconds: start,
						endSeconds: end,
					})
					.then(onPlayerReady);
			}

			return <div id="youtube-player" />;
		},
	};
});
