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
	objectToQueryParams,
	onDesktop,
	urlQueryParamsAsObject,
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
	`crotchet://app/youtubeClips?${objectToQueryParams(clip)}`;

registerDataSource("firebase", "youtubeClips", {
	label: "Youtube Clips",
	collection: "videos",
	orderBy: "updatedAt,desc",
	mapEntry: (entry) => ({
		...entry,
		video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
		title: entry.name,
		subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
			?.map(toHms)
			.join(", ")} - ${toHms(entry.duration)}`,
		share: getShareUrl({
			scheme: "youtubeClips",
			state: entry,
			url: entry.url,
			preview: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
			title: entry.name,
		}),
		url: getYoutubeClipUrl(entry),
	}),
	searchFields: ["title"],
	layoutProps: {
		layout: "grid",
		columns: "sm:2,2xl:3,4xl:4",
	},
});

registerAction("getRandomYoutubeClip", {
	label: "Random Clip",
	global: true,
	icon: appIcon,
	handler: async (_, { dataSources }) =>
		openUrl(getYoutubeClipUrl(await dataSources.youtubeClips.random())),
});

registerAction("searchYoutubeClips", {
	type: "search",
	url: `crotchet://search/youtubeClips`,
	tags: ["video", "search"],
});

registerAction("addToYoutubeClips", {
	context: "share",
	icon: appIcon,
	match: ({ scheme, url }) =>
		scheme != "youtubeClips" && url?.toString().length && getYoutubeId(url),
	handler: async ({ url }, { showToast }) => {
		showToast("Added youtube clip: " + url);
	},
});

registerAction("editClip", {
	context: "share",
	icon: appIcon,
	match: ({ scheme, state }) => scheme == "youtubeClips" && state._id,
	handler: ({ state }) =>
		openUrl(
			getYoutubeClipUrl(state).replace(
				"crotchet://app/youtubeClips",
				"crotchet://app/youtubeClips/edit/"
			)
		),
});

registerAction("playOnDesktop", {
	context: "share",
	icon: appIcon,
	mobileOnly: true,
	match: ({ scheme, state }) => scheme == "youtubeClips" && state._id,
	handler: ({ state }) =>
		openUrl(
			getYoutubeClipUrl(state).replace(
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
			const openOnDesktop = () => {
				window.__crotchet.socketEmit("app", {
					scheme: "youtubeClips",
					url: path.replace(
						"/youtubeClips/desktop/",
						"/youtubeClips"
					),
					window: {
						width: 1280,
						height: 800,
					},
				});
			};

			if (onDesktop()) return openOnDesktop();

			if (path.startsWith("/youtubeClips/edit/")) {
				return showToast("Edit youtube clip");
			}

			const _socket = await socket({ retry: true });
			if (_socket) return openOnDesktop();

			const props = urlQueryParamsAsObject(
				"https://crotchet.app/" + path
			);

			openPage({
				background: "black",
				noPadding: true,
				noScroll: true,
				centerContent: true,
				content: [
					{
						type: "custom",
						value: <YoutubePlayer {...props} />,
					},
				],
			});
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
