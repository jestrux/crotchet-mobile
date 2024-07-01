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
	registerActionSheet,
	getShareActions,
	objectTake,
	randomId,
} from "@/crotchet";

const openOnDesktop = (path) => {
	window.__crotchet.socketEmit("app", {
		scheme: "youtubeClips",
		url: path.replace("/youtubeClips/desktop/", "/youtubeClips"),
		window: {
			fullScreen: true,
		},
	});
};

const YoutubePlayerStates = {
	unstarted: -1,
	ended: 0,
	playing: 1,
	paused: 2,
	buffering: 3,
	"video cued": 5,
};

const initYoutubePlayer = () => {
	return new Promise((resolve) => {
		const iframeId = "youtube-clips-player-iframe";
		let script = document.querySelector(`#${iframeId}`);

		if (!script) {
			script = document.createElement("script");
			script.id = iframeId;
			script.src = "https://www.youtube.com/iframe_api";
			document.body.appendChild(script);
		}

		if (!window.YT?.Player) {
			window.onYouTubeIframeAPIReady = () => {
				resolve(
					(playerId, props) => new window.YT.Player(playerId, props)
				);
			};

			return;
		}

		resolve((playerId, props) => new window.YT.Player(playerId, props));
	});
};

const YoutubePlayer = ({ _id, crop, duration, width, height, ...props }) => {
	const [loading, setLoading] = useState(true);
	const videoId = _id || props.id;
	const [start, end] = (crop || [0, duration]).map(Number);
	const player = useRef();

	useEffect(() => {
		initPlayer();

		return () => {
			// window.YT = null;
		};
	}, []);

	const togglePlay = () => {
		if (!player.current) return;

		player.current.getPlayerState() == YoutubePlayerStates.paused
			? player.current.playVideo()
			: player.current.pauseVideo();
	};

	const initPlayer = () => {
		let script = document.querySelector("#youtube-player-iframe");

		if (!script) {
			script = document.createElement("script");
			script.id = "youtube-player-iframe";
			script.src = "https://www.youtube.com/iframe_api";
			document.body.appendChild(script);
		}

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

const getYoutubeVideoDetails = async (url) => {
	const videoId = getYoutubeId(url);
	const playerId = `youtube-player${randomId()}`;
	const playerEl = document.createElement("div");
	playerEl.id = playerId;
	// playerEl.innerHTML = `
	// <iframe
	// 		id="${playerId}"
	// 		className="pointer-events-none size-full"
	// 		src="https://www.youtube.com/embed/${videoId}?controls=0&autoplay=0&enablejsapi=1"
	// 		allow="autoplay; encrypted-media"
	// 		allowFullScreen
	// 		onLoad={() => setLoading(false)}
	// 	></iframe>
	// `;
	document.body.appendChild(playerEl);

	return new Promise((resolve) => {
		initYoutubePlayer().then((playMaker) => {
			playMaker(playerId, {
				videoId,
				playerVars: {
					playsinline: "1",
					theme: "light",
					color: "white",
					modestbranding: 1,
					rel: 0,
				},
				events: {
					onReady: (e) => {
						const player = e.target;
						const duration = player.getDuration();
						playerEl.remove();

						if (!duration) {
							showToast("Invalid youtube video");
							return resolve(null);
						}

						resolve({
							id: videoId,
							name: player.videoTitle,
							poster: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
							duration,
							crop: [0, duration],
							url: `https://www.youtube.com/watch?v=${videoId}`,
						});
					},
					onStateChange: () => {
						// const player = e.target;
					},
				},
			});
		});
	});
};

const getYoutubeVideoEditor = async (url, openPage, oldValues = {}) => {
	return openPage({
		title: "Add Youtube Clip",
		content: async () => {
			const payload = await getYoutubeVideoDetails(url);
			Object.assign(payload, oldValues);

			return [
				{
					type: "preview",
					value: {
						large: true,
						video: `https://i.ytimg.com/vi/${payload.id}/hqdefault.jpg`,
						title: payload.name,
						subtitle: `${[payload.crop?.[0], payload.crop?.[1]]
							?.map(toHms)
							.join(", ")} - ${toHms(payload.duration)}`,
					},
				},
				{
					type: "action",
					value: {
						label: "Save Clip",
						onClick: ({ dismiss }) => dismiss(payload),
					},
				},
			];
		},
	});
};

// const getYoutubeClipUrl = ({ _id, crop, duration } = {}) => {
// 	const [start] = (crop || [0, duration]).map(Number);
// 	return `https://youtube.com/watch?v=${_id}&t=${start.toFixed(0)}`;
// };

const getYoutubeClipUrl = (clip) =>
	`crotchet://app/youtubeClips?${objectToQueryParams(clip)}`;

registerDataSource("db", "youtubeClips", {
	table: "youtubeClips",
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
			sheet: "youtubeClips",
			scheme: "youtubeClips",
			state: entry,
			url: entry.url,
			video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
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
	scheme: "youtubeClips",
	match: ({ url }) => url?.toString().length && getYoutubeId(url),
	handler: async ({ url }, { openPage, showToast, dbInsert }) => {
		const res = await getYoutubeVideoEditor(url, openPage);

		if (!res) return;

		try {
			const video = await dbInsert("youtubeClips", {
				...(res ?? {}),
				_rowId: res.id,
			});
			showToast(`${res?.name || "Youtube Clip"} Added `);
			return video;
		} catch (error) {
			showToast(`Failed to add ${res?.name || "Youtube Clip"}`);
			console.log("Add youtube clip error: ", error);
		}
	},
});

registerAction("editYoutubeClip", {
	context: "share",
	icon: appIcon,
	label: "Edit Video",
	scheme: "youtubeClips",
	match: ({ scheme, state }) => scheme == "youtubeClips" && state._id,
	handler: async (
		{ state },
		{ dataSources, openChoicePicker, openForm, openPage }
	) => {
		const action = await openChoicePicker({
			// title: "Edit Youtube ",
			choices: ["Edit Video Details", "Edit Video Source"],
		});

		if (!action) return;

		if (action == "Edit Video Source") {
			const url = await openForm({
				title: "Edit Youtube Clip",
				field: {
					label: "URL",
					url: "text",
					defaultValue: state.url,
				},
			});

			if (!url) return;

			const res = await getYoutubeVideoEditor(url, openPage, {
				crop: state.crop,
			});

			await dataSources.youtubeClips.deleteRow(state._id);

			const video = await dataSources.youtubeClips.insertRow({
				...(res ?? {}),
				_rowId: res.id,
			});

			showToast("Clip Source Updated");

			return video;
		}

		const res = await openForm({
			title: "Edit Youtube Clip",
			data: state,
			fields: {
				name: "text",
				poster: "text",
			},
		});

		if (!res) return;

		return dataSources.youtubeClips.updateRow(state._id, res);
	},
});

registerAction("deleteYoutubeClip", {
	context: "share",
	icon: appIcon,
	label: "Delete Video",
	scheme: "youtubeClips",
	match: ({ scheme, state }) => scheme == "youtubeClips" && state._id,
	handler: async (
		{ state },
		{ dataSources, showToast, confirmDangerousAction }
	) => {
		const confirmed = await confirmDangerousAction();

		if (!confirmed) return;

		try {
			await dataSources.youtubeClips.deleteRow(state._id);
			showToast("Clip deleted");
		} catch (error) {
			showToast("Failed to delete clip");
			console.log(error);
		}
	},
});

registerAction("playOnDesktop", {
	context: "share",
	icon: appIcon,
	mobileOnly: true,
	scheme: "youtubeClips",
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
			if (onDesktop()) return openOnDesktop(path);

			if (path.startsWith("/youtubeClips/edit/"))
				return showToast("Edit youtube clip");

			if (path.indexOf("desktop") != -1) {
				const _socket = await socket({ retry: true });
				if (_socket) return openOnDesktop(path);
			}

			const props = urlQueryParamsAsObject(path);

			openPage({
				fullHeight: true,
				background: "black",
				noPadding: true,
				noScroll: true,
				centerContent: true,
				content: <YoutubePlayer {...props} />,
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

registerActionSheet("youtubeClips", async (payload = {}, { actions }) => {
	const clipUrl = getYoutubeClipUrl(payload.state);

	return {
		...payload,
		actions: getShareActions(payload, {
			playVideo: {
				icon: appIcon,
				label: "Play Video",
				context: "share",
				scheme: "youtubeClips",
				handler: (_, { openUrl }) => openUrl(clipUrl),
			},
			playOnDesktop: actions.playOnDesktop,
			shareVideo: {
				icon: appIcon,
				label: "Share Video",
				context: "share",
				scheme: "youtubeClips",
				handler: (_, { openUrl }) =>
					openUrl(`crotchet://broadcast/url/${payload.url})}`),
			},
			...objectTake(actions, ["editYoutubeClip", "deleteYoutubeClip"]),
		}),
	};
});
