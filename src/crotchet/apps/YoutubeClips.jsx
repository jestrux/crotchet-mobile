import {
	useState,
	useEffect,
	useRef,
	Loader,
	SearchPage,
	registerAction,
	registerApp,
	registerDataSource,
	showToast,
	toHms,
	useAppContext,
	objectToQueryParams,
	onDesktop,
	urlQueryParamsAsObject,
	randomId,
	camelCaseToSentenceCase,
	useEventListener,
} from "@/crotchet";

const openOnDesktop = (path) => {
	window.__crotchet.socketEmit("app", {
		scheme: "youtubeClips",
		url: path.replace("/youtubeClips/desktop/", "/youtubeClips"),
		window: {
			// maximize: true,
			// fullScreen: true,
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

const YoutubePlayer = ({
	_id,
	editting,
	crop,
	duration,
	width,
	height,
	...props
}) => {
	const [loading, setLoading] = useState(true);
	const videoId = _id || props.id;
	const [start, end] = (crop || [0, duration]).map(Number);
	const cropRef = useRef([start, end]);
	const player = useRef();

	useEffect(() => {
		initPlayer();

		return () => window.removeEventListener("message", listenForTime);
	}, []);

	useEventListener("form-data-changed", (_, { start, end }) => {
		cropRef.current = [start, end].map(Number);
	});

	const listenForTime = (event) => {
		const iframeWindow = player.current.getIframe().contentWindow;
		let lastTimeUpdate = 0;

		if (event.source === iframeWindow) {
			const data = JSON.parse(event.data);

			if (
				data.event === "infoDelivery" &&
				data.info &&
				data.info.currentTime
			) {
				var time = Number(data.info.currentTime.toFixed(3));

				if (time !== lastTimeUpdate) {
					lastTimeUpdate = time;

					const [start, end] = cropRef.current.map((time) =>
						Number(time.toFixed(3))
					);

					if (time >= end || time <= start) {
						player.current.seekTo(start);
						player.current.playVideo();
					}
				}
			}
		}
	};

	const togglePlay = () => {
		if (!player.current) return;

		player.current.getPlayerState() == YoutubePlayerStates.paused
			? player.current.playVideo()
			: player.current.pauseVideo();
	};

	const handleReady = (e) => {
		setLoading(false);
		if (e?.target) {
			if (!player.current) {
				player.current = new window.YT.Player("youtube-player");
				if (editting) window.addEventListener("message", listenForTime);
			}

			return;
		}

		if (!player.current) initPlayer();
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
					onReady: () => {
						// handleReady();
					},
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
				onLoad={handleReady}
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
							_id: videoId,
							title: player.videoTitle,
							name: player.videoTitle,
							poster: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
							duration,
							start: 0,
							end: duration,
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
		type: "preview",
		title: "Add Youtube Clip",
		resolve: async () => {
			const payload = await getYoutubeVideoDetails(url);
			if (!payload?.id) throw `Failed to load video for ${url}`;

			return {
				...payload,
				...oldValues,
			};
		},
		action: ({ pageData }) => ({
			label: "Save Clip",
			handler: ({ dismiss }) => dismiss(pageData),
		}),
		content: (video) => {
			if (!video) return;

			return {
				type: "preview",
				value: {
					large: true,
					video: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
					title: video.name,
					subtitle: `${[video.crop?.[0], video.crop?.[1]]
						?.map(toHms)
						.join(", ")} - ${toHms(video.duration)}`,
				},
			};
		},
	});
};

const editVideo = async (title, payload, openForm, handler) => {
	const video = {
		start: payload.crop?.at(0) || 0,
		end: payload.crop?.at(1) || payload.duration,
		...payload,
	};

	return await openForm({
		title,
		data: video,
		resolve: () => video,
		preview({ pageData: video }) {
			if (!video) return null;

			return (
				<div className="aspect-[16/10] bg-black">
					<YoutubePlayer
						editting
						_id={video._id}
						crop={[video.start, video.end]}
						duration={video.duration}
					/>
				</div>
			);
		},
		fields: {
			title: "text",
			poster: "image",
			start: "text",
			end: "text",
		},
		action: {
			label: "Save Clip",
			handler,
		},
	});
};

const getYoutubeActualUrl = ({ _id, crop, duration } = {}) => {
	const [start] = (crop || [0, duration]).map(Number);
	return `https://youtube.com/watch?v=${_id}&t=${start.toFixed(0)}`;
};

const getYoutubeClipUrl = (clip) =>
	`crotchet://app/youtubeClips?${objectToQueryParams(clip)}`;

const getActions = (payload) => {
	const clipUrl = getYoutubeClipUrl(payload);
	const actions = {
		playVideo: {
			icon: appIcon,
			url: clipUrl,
			section: "Play",
		},
		...(onDesktop()
			? {}
			: {
					playOnDesktop: {
						icon: appIcon,
						match: (_, { onDesktop }) => !onDesktop(),
						url: clipUrl.replace(
							"crotchet://app/youtubeClips",
							"crotchet://app/youtubeClips/desktop/"
						),
					},
			  }),
		playOnYoutube: {
			icon: (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
					/>
				</svg>
			),
			url: getYoutubeActualUrl(payload),
			section: "Play",
		},
		// shareVideo: {
		// 	icon: appIcon,
		// 	label: "Share",
		// 	url: `crotchet://broadcast/url/${payload.url}}`,
		// },
		editYoutubeClip: {
			icon: appIcon,
			label: "Edit Video",
			section: "Edit",
			handler: async (_, { dataSources, openForm }) => {
				return editVideo(
					"Edit Youtube Clip",
					payload,
					openForm,
					(editedVideo) => {
						console.log("Save video: ", editedVideo);

						if (!editedVideo) return;

						return dataSources.youtubeClips.updateRow(
							payload._id,
							editedVideo
						);
					}
				);
			},
		},
		editYoutubeClipSource: {
			icon: appIcon,
			label: "Change Source",
			section: "Edit",
			handler: async (_, { dataSources, openForm, openPage }) => {
				const url = await openForm({
					title: "Change Clip Source",
					field: {
						label: "URL",
						url: "text",
						defaultValue: payload.url,
					},
				});

				if (!url) return;

				const res = await getYoutubeVideoEditor(url, openPage, {
					crop: payload.crop,
				});

				await dataSources.youtubeClips.deleteRow(payload._id);

				const video = await dataSources.youtubeClips.insertRow({
					...(res ?? {}),
					_rowId: res.id,
				});

				showToast("Clip Source Updated");

				return video;
			},
		},
		deleteYoutubeClip: {
			icon: appIcon,
			label: "Delete Video",
			destructive: true,
			handler: async (
				_,
				{ dataSources, showToast, confirmDangerousAction }
			) => {
				const confirmed = await confirmDangerousAction();

				if (!confirmed) return;

				try {
					await dataSources.youtubeClips.deleteRow(payload._id);
					showToast("Clip deleted");
				} catch (error) {
					showToast("Failed to delete clip");
					console.log(error);
				}
			},
		},
	};

	return Object.entries(actions).reduce((agg, [name, action]) => {
		return [
			...agg,
			{
				name,
				label: camelCaseToSentenceCase(name),
				...action,
			},
		];
	}, []);
};

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
		url: getYoutubeClipUrl(entry),
	}),
	searchFields: ["title"],
	layoutProps: {
		layout: "grid",
		aspectRatio: "16/9",
		columns: "sm:2,2xl:3,4xl:4",
	},
	actions: [
		{
			label: "Random Clip",
			handler: async (_, { dataSources, openUrl }) =>
				openUrl(
					getYoutubeClipUrl(await dataSources.youtubeClips.random())
				),
			section: "Play",
		},
		{
			label: "Latest Clip",
			handler: async (_, { dataSources, openUrl }) =>
				openUrl(
					getYoutubeClipUrl(await dataSources.youtubeClips.latest())
				),
			section: "Play",
		},
		{
			label: "Add Clip",
			handler: async (_, { readClipboard, openForm, dataSources }) => {
				const url = (await readClipboard())?.value;

				const video = await openForm({
					title: "Add Youtube Clip",
					field: {
						label: "Video URL",
						defaultValue: getYoutubeId(url) ? url : "",
					},
					action: {
						handler: async (url) => {
							if (!url?.length) throw "Video URL is required";

							const videoId = getYoutubeId(url);
							if (!videoId)
								throw `${url} is not a vaild Youtube URL`;

							return await getYoutubeVideoDetails(
								getYoutubeActualUrl({
									_id: videoId,
								})
							);
						},
					},
				});

				if (!video?.id) return;

				return editVideo("Add Youtube Clip", video, openForm, (res) => {
					if (!res?.id) return;

					return dataSources.youtubeClips.insertRow({
						...(res ?? {}),
						name: res.title,
						crop: [res.start, res.end],
						_rowId: res._id,
					});
				});
			},
		},
	],
	entryActions: getActions,
	entryAction: (entry) => ({
		label: "Play Video",
		url: entry.url,
	}),
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
