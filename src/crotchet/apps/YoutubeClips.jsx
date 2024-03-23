import {
	useState,
	useEffect,
	useRef,
	Loader,
	SearchPage,
	getShareUrl,
	openUrl,
	registerAction,
	registerApp,
	registerDataSource,
	showToast,
	toHms,
	useAppContext,
} from "@/crotchet";

const YoutubePlayer = ({ _id, crop, duration, width, height, ...props }) => {
	const [loading, setLoading] = useState(true);

	const YoutubePlayerStates = {
		unstarted: -1,
		ended: 0,
		playing: 1,
		paused: 2,
		buffering: 3,
		"video cued": 5,
	};

	const videoId = _id || props.id;
	const [start, end] = (crop || `0,${duration}`).split(",").map(Number);
	const player = useRef();

	useEffect(() => {
		initPlayer();

		return () => {
			window.YT = null;
		};
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
					onReady: () => setLoading(false),
					onStateChange: onPlayerStateChange,
				},
			});
		};

		function onPlayerStateChange(event) {
			setLoading(false);

			if (event.data == YoutubePlayerStates.ended) {
				player.current.seekTo(start);
				player.current.playVideo();
			}
		}
	};

	return (
		<div
			className="bg-black text-white relative"
			style={{
				width: width ? `${width}px` : "100%",
				height: height ? `${height}px` : "100%",
				aspectRatio: width && height ? "" : "16/9",
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
				onLoad={() => setLoading(false)}
			></iframe>

			{loading && <Loader className="mt-2 ml-1" size="80" fillParent />}
		</div>
	);
};

const appIcon = (
	<svg fill="currentColor" viewBox="0 0 24 24">
		<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
	</svg>
);

const getYoutubeId = (url) => {
	if (!url?.length) return null;

	return url.match(
		// eslint-disable-next-line no-useless-escape
		/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
	)?.[1];
};

const getYoutubeClipUrl = (clip) =>
	`crotchet://app/youtubeClips?${new URLSearchParams(clip).toString()}`;

registerDataSource("firebase", "youtubeClips", {
	label: "Youtube Clips",
	collection: "videos",
	orderBy: "updatedAt,desc",
	layout: "grid",
	mapEntry: (entry) => ({
		...entry,
		video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
		title: entry.name,
		subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
			?.map(toHms)
			.join(", ")} - ${toHms(entry.duration)}`,
		share: getShareUrl(
			{
				preview: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
				title: entry.name,
				url: getYoutubeClipUrl(entry),
			},
			"object"
		),
		url: getYoutubeClipUrl(entry),
	}),
	searchFields: ["title"],
});

registerAction("getRandomYoutubeClip", {
	global: true,
	icon: appIcon,
	handler: async (_, { dataSources }) =>
		openUrl(getYoutubeClipUrl(await dataSources.youtubeClips.random())),
});

registerAction("addToYoutubeClips", {
	context: "share",
	icon: appIcon,
	match: ({ url }) => url?.toString().length && getYoutubeId(url),
	handler: async ({ url }, { showToast }) => {
		showToast("Added youtube clip: " + url);
	},
});

registerAction("editClip", {
	context: "share",
	icon: appIcon,
	match: ({ url }) =>
		url?.toString().startsWith("crotchet://app/youtubeClips"),
	handler: ({ url }) =>
		openUrl(
			url.replace(
				"crotchet://app/youtubeClips",
				"crotchet://app/youtubeClips/edit/"
			)
		),
});

registerAction("playOnDesktop", {
	context: "share",
	icon: appIcon,
	mobileOnly: true,
	match: ({ url }) =>
		url?.toString().startsWith("crotchet://app/youtubeClips"),
	handler: ({ url }) =>
		openUrl(
			url.replace(
				"crotchet://app/youtubeClips",
				"crotchet://app/youtubeClips/desktop/"
			)
		),
});

registerApp("youtubeClips", () => {
	return {
		icon: appIcon,
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
		async load(path, { socket, openPage }) {
			if (path.startsWith("/youtubeClips/desktop/")) {
				const _socket = await socket({ retry: true });
				if (!_socket) return showToast("Desktop not connected");

				window.__crotchet.socketEmit("app", {
					scheme: "youtubeClips",
					url: path.replace(
						"/youtubeClips/desktop/",
						"/youtubeClips"
					),
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

			if (path.startsWith("/youtubeClips/edit/")) {
				return showToast("Edit youtube clip");
			}

			const url = new URL("https://" + path);
			const props = Object.fromEntries(url.searchParams.entries());

			openPage({
				noPadding: true,
				noScroll: true,
				centerContent: true,
				// title: props.name,
				content: [
					{
						type: "custom",
						value: <YoutubePlayer {...props} />,
					},
				],
			});

			// const url = new URL("https://" + path);
			// const params = url.searchParams;
			// const id = params.get("id") || params.get("_id");
			// const [start] = params.get("crop").split(",");

			// window.open(
			// 	`https://www.youtube.com/watch?v=${id}&t=${start}s`,
			// 	"_blank"
			// );
		},
		open: function Open(props) {
			return (
				<YoutubePlayer
					{...props}
					height={window.innerHeight}
					width={window.innerWidth}
				/>
			);
		},
	};
});
