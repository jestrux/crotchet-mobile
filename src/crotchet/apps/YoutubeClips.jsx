import {
	openUrl,
	registerAction,
	registerApp,
	registerDataSource,
} from "@/crotchet";
import { useEffect, useRef } from "react";

const getYoutubeClipUrl = (clip) =>
	`crotchet://app/youtube-clips?${new URLSearchParams(clip).toString()}`;

registerDataSource("firebase", "youtube-clips", {
	label: "Youtube Clips",
	collection: "videos",
	orderBy: "updatedAt,desc",
	fieldMap: {
		video: "poster",
		title: "name",
		subtitle: "crop.0|time::crop.1|time::duration|time",
	},
	mapEntry(item) {
		return {
			...item,
			url: getYoutubeClipUrl(item),
		};
	},
	searchFields: ["name"],
});

registerAction("getRandomYoutubeClip", {
	global: true,
	handler: async ({ dataSources }) => {
		const res = await dataSources["youtube-clips"].random();
		return openUrl(getYoutubeClipUrl(res));
	},
});

registerApp("youtube-clips", () => {
	const YoutubePlayerStates = {
		unstarted: -1,
		ended: 0,
		playing: 1,
		paused: 2,
		buffering: 3,
		"video cued": 5,
	};

	return {
		name: "Youtube Clips",
		load(path, { socketConnected }) {
			if (socketConnected()) {
				window.__crotchet.socketEmit("app", {
					scheme: "youtube-clips",
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
			const player = useRef();

			useEffect(() => {
				initPlayer();
			}, []);

			const togglePlay = () => {
				if (!player.current) return;

				player.current.getPlayerState() == YoutubePlayerStates.paused
					? player.current.playVideo()
					: player.current.pauseVideo();
			};

			const initPlayer = () => {
				const script = document.createElement("script");
				script.id = "youtube-player-iframe";
				script.src = "https://www.youtube.com/iframe_api";
				document.body.appendChild(script);

				window.onYouTubeIframeAPIReady = () => {
					player.current = new window.YT.Player("youtube-player", {
						events: {
							// onReady: onPlayerReady,
							onStateChange: onPlayerStateChange,
						},
					});
				};

				function onPlayerStateChange(event) {
					if (event.data == YoutubePlayerStates.ended) {
						player.current.seekTo(start);
						player.current.playVideo();
					}
				}
			};

			return (
				<div
					style={{
						height: window.innerHeight,
						width: window.innerWidth,
					}}
					onClick={togglePlay}
				>
					<iframe
						id="youtube-player"
						className="pointer-events-none size-full"
						src={`https://www.youtube.com/embed/${videoId}?controls=0&start=${start.toFixed(
							0
						)}&end=${end.toFixed(0)}&autoplay=1&enablejsapi=1`}
						allow="autoplay; encrypted-media"
						allowFullScreen
					></iframe>
				</div>
			);
		},
	};
});
