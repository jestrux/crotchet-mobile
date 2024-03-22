import {
	SearchPage,
	openUrl,
	registerAction,
	registerApp,
	registerDataSource,
	toHms,
	useAppContext,
} from "@/crotchet";
import { useEffect, useRef } from "react";

const getYoutubeClipUrl = (clip) =>
	`crotchet://app/youtubeClips?${new URLSearchParams(clip).toString()}`;

registerDataSource("firebase", "youtubeClips", {
	label: "Youtube Clips",
	collection: "videos",
	orderBy: "updatedAt,desc",
	layout: "grid",
	// fieldMap: {
	// 	video: "poster",
	// 	title: "name",
	// 	subtitle: "crop.0|time::crop.1|time::duration|time",
	// },
	mapEntry: (entry) => ({
		...entry,
		video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
		title: entry.name,
		subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
			?.map(toHms)
			.join(", ")} - ${toHms(entry.duration)}`,
		share: `crotchet://share-url/${entry.url}`,
		url: getYoutubeClipUrl(entry),
	}),
	searchFields: ["name"],
});

registerAction("getRandomYoutubeClip", {
	global: true,
	handler: async (_, { dataSources }) => {
		const res = await dataSources.youtubeClips.random();
		return openUrl(getYoutubeClipUrl(res));
	},
});

registerApp("youtubeClips", () => {
	const YoutubePlayerStates = {
		unstarted: -1,
		ended: 0,
		playing: 1,
		paused: 2,
		buffering: 3,
		"video cued": 5,
	};

	return {
		icon: (
			<svg fill="currentColor" viewBox="0 0 24 24">
				<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
			</svg>
		),
		name: "Youtube Clips",
		main: function LaCroix() {
			const { dataSources } = useAppContext();
			return (
				<SearchPage
					autoFocus={false}
					source={dataSources.youtubeClips}
				/>
			);
		},
		load(path, { socketConnected }) {
			if (socketConnected()) {
				window.__crotchet.socketEmit("app", {
					scheme: "youtubeClips",
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
