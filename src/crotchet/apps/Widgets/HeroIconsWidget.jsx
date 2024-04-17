import {
	useAppContext,
	DataWidget,
	registerDataSource,
	registerAction,
	registerActionSheet,
	objectTake,
	objectToQueryParams,
	openUrl,
	onDesktop,
} from "@/crotchet";

const heroiconTags = {
	"academic-cap": [
		"degree",
		"diploma",
		"graduation",
		"hat",
		"school",
		"university",
	],
	"adjustments-horizontal": ["filter", "settings", "sliders"],
	"adjustments-vertical": ["filter", "settings", "sliders"],
	"archive-box": ["box", "store"],
	"archive-box-arrow-down": ["box", "download", "store"],
	"archive-box-x-mark": ["box", "cancel", "delete", "remove", "store"],
	"arrow-down-on-square": ["download"],
	"arrow-down-on-square-stack": ["download"],
	"arrow-down-tray": ["download"],
	"arrow-left-on-rectangle": ["logout", "sign-out"],
	"arrow-path": ["refresh", "reload", "restart", "update"],
	"arrow-right-on-rectangle": ["login", "sign-in"],
	"arrow-top-right-on-square": ["external"],
	"arrow-trending-down": ["analytics", "decrease"],
	"arrow-trending-up": ["analytics", "increase"],
	"arrow-up-on-square": ["upload"],
	"arrow-up-on-square-stack": ["upload"],
	"arrow-up-tray": ["upload"],
	"arrow-uturn-left": ["back", "previous"],
	"arrow-uturn-right": ["forward", "next"],
	"arrows-pointing-in": ["collapse"],
	"arrows-pointing-out": ["expand"],
	"arrows-right-left": ["switch"],
	"arrows-up-down": ["switch"],
	"at-symbol": ["@", "email"],
	backspace: ["delete", "remove"],
	backward: ["previous", "rewind"],
	banknotes: ["bill", "cash", "money", "payment", "price"],
	"bars-2": ["hamburger", "menu"],
	"bars-3": ["hamburger", "menu"],
	"bars-4": ["hamburger", "menu"],
	beaker: ["chemical", "chemistry", "formula", "potion", "science"],
	bell: ["alert", "notification"],
	"bell-alert": ["notification"],
	"bell-slash": ["notification", "silence"],
	"bell-snooze": ["notification", "silence"],
	bolt: ["electric", "electricity", "flash", "lightning", "power", "zap"],
	"bolt-slash": [
		"electric",
		"electricity",
		"flash",
		"lightning",
		"power",
		"zap",
	],
	bookmark: ["favorite", "save"],
	"bookmark-slash": ["delete", "favorite", "remove", "save"],
	"bookmark-square": ["favorite", "save"],
	briefcase: ["business", "job", "office", "work"],
	"building-library": ["administration", "institution"],
	"building-office": ["apartment", "flat", "skyscraper", "work"],
	"building-office-2": ["apartment", "flat", "skyscraper", "work"],
	"building-storefront": ["shop"],
	cake: ["birthday", "celebrate", "party"],
	calculator: ["mathematics", "maths", "numbers"],
	calendar: ["date", "day", "event", "month", "year"],
	"calendar-days": ["date", "event", "month", "year"],
	camera: ["photo", "picture"],
	"chart-bar": ["analytics", "graph", "statistics", "stats"],
	"chart-bar-square": ["analytics", "graph", "statistics", "stats"],
	"chart-pie": ["analytics", "graph", "statistics", "stats"],
	"chat-bubble-bottom-center": [
		"bubble",
		"comment",
		"discussion",
		"message",
		"response",
		"speech",
	],
	"chat-bubble-bottom-center-text": [
		"bubble",
		"comment",
		"discussion",
		"message",
		"response",
		"speech",
	],
	"chat-bubble-left": [
		"bubble",
		"comment",
		"discussion",
		"message",
		"response",
		"speech",
	],
	"chat-bubble-left-ellipsis": [
		"bubble",
		"comment",
		"discussion",
		"message",
		"response",
		"speech",
	],
	"chat-bubble-left-right": [
		"bubble",
		"comment",
		"discussion",
		"message",
		"response",
		"speech",
	],
	"chat-bubble-oval-left": [
		"bubble",
		"comment",
		"discussion",
		"message",
		"response",
		"speech",
	],
	"chat-bubble-oval-left-ellipsis": [
		"bubble",
		"comment",
		"discussion",
		"message",
		"response",
		"speech",
	],
	check: ["confirm", "correct", "ok", "tick", "valid", "verified"],
	"check-badge": ["confirm", "correct", "tick", "verified"],
	"check-circle": ["confirm", "correct", "tick", "verified"],
	"chevron-double-down": ["arrow-double-down"],
	"chevron-double-left": ["arrow-double-left"],
	"chevron-double-right": ["arrow-double-right"],
	"chevron-double-up": ["arrow-double-up"],
	"chevron-down": ["arrow-down", "caret-down"],
	"chevron-left": ["arrow-left", "caret-left"],
	"chevron-right": ["arrow-right", "caret-right"],
	"chevron-up": ["arrow-up", "caret-up"],
	"chevron-up-down": ["select", "option"],
	"circle-stack": ["collection", "database", "storage"],
	clipboard: ["copy", "cut", "paste"],
	"clipboard-document": ["copy", "cut", "paste"],
	"clipboard-document-check": ["clipboard-tick"],
	"clipboard-document-list": ["copy", "cut", "paste"],
	clock: ["time", "watch"],
	cog: ["gear", "settings"],
	"cog-6-tooth": ["gear", "settings"],
	"cog-8-tooth": ["gear", "settings"],
	"command-line": ["cli", "code", "console", "terminal"],
	"computer-desktop": ["mac", "monitor", "pc", "windows"],
	"cpu-chip": ["computer", "electronics", "pc"],
	"credit-card": ["debit", "money", "payment", "price"],
	cube: ["3d"],
	"currency-dollar": ["money", "payment", "price", "usd"],
	"currency-euro": ["eur", "euro", "money", "payment", "price"],
	"currency-pound": ["gbp", "money", "payment", "price"],
	"currency-rupee": ["inr", "money", "payment", "price"],
	"currency-yen": ["money", "payment", "price"],
	"cursor-arrow-rays": ["cursor-pointer", "mouse-click"],
	"cursor-arrow-ripple": ["cursor-pointer", "mouse-click"],
	"device-phone-mobile": ["android", "iphone", "phone", "smartphone"],
	"device-tablet": ["ipad", "kindle"],
	document: ["pdf", "sim"],
	"document-duplicate": ["clone", "copy"],
	"document-magnifying-glass": ["search"],
	"document-minus": ["document-delete"],
	"ellipsis-horizontal": ["meatballs", "more"],
	"ellipsis-horizontal-circle": ["more", "options"],
	"ellipsis-vertical": ["kebab", "more"],
	envelope: ["letter", "mail", "message"],
	"envelope-open": ["letter", "mail", "message"],
	"exclamation-circle": ["caution", "error", "warning"],
	"exclamation-triangle": ["caution", "error", "warning"],
	eye: ["public", "seen", "visible"],
	"eye-slash": ["hidden", "invisible", "private", "unseen"],
	"face-frown": ["emoji", "sad"],
	"face-smile": ["emoji", "happy"],
	film: ["cinema", "movie"],
	"finger-print": ["touch-id"],
	fire: ["burn", "flame", "hot", "lit"],
	flag: ["report"],
	"folder-arrow-down": ["folder-download"],
	"folder-minus": ["folder-delete", "folder-remove"],
	"folder-plus": ["folder-add", "folder-new"],
	forward: ["fast-forward", "next", "skip"],
	funnel: ["adjustments", "filter"],
	gif: ["animation", "image"],
	gift: ["present", "reward"],
	"gift-top": ["present", "reward"],
	"globe-alt": ["earth", "planet", "website", "world", "www"],
	"globe-americas": ["earth", "planet", "website", "world", "www"],
	"globe-asia-australia": ["earth", "planet", "website", "world", "www"],
	"globe-europe-africa": ["earth", "planet", "website", "world", "www"],
	"hand-raised": ["grab"],
	"hand-thumb-down": ["dislike"],
	"hand-thumb-up": ["like"],
	hashtag: ["octothorp", "pound-sign"],
	heart: ["love", "relationship"],
	home: ["building", "house"],
	"home-modern": ["building", "house"],
	inbox: ["email", "message"],
	"inbox-arrow-down": ["email", "message"],
	"inbox-stack": ["email", "message"],
	"information-circle": ["help"],
	language: ["i18n", "international", "intl", "l10n", "translate"],
	lifebuoy: ["help", "life-ring", "overboard"],
	"light-bulb": ["insight"],
	link: ["attachment", "connect", "url"],
	"lock-closed": ["secure", "security"],
	"lock-open": ["security", "unlock"],
	"magnifying-glass": ["search"],
	"magnifying-glass-circle": ["search"],
	"magnifying-glass-minus": ["zoom-out"],
	"magnifying-glass-plus": ["zoom-in"],
	"map-pin": ["location", "marker"],
	microphone: ["audio", "podcast", "record"],
	minus: ["delete", "remove", "subtract"],
	"minus-circle": ["delete", "remove", "subtract"],
	moon: ["dark", "night"],
	"musical-note": ["song"],
	"no-symbol": [
		"bad",
		"block",
		"end",
		"halt",
		"not-allowed",
		"stop",
		"unauthorized",
	],
	"paper-airplane": ["send"],
	"paper-clip": ["attachment", "document", "link"],
	pencil: ["edit", "note", "write"],
	"pencil-square": ["edit", "note", "write"],
	photo: ["gallery", "image", "picture"],
	plus: ["add", "create", "new"],
	"plus-circle": ["add", "create"],
	"puzzle-piece": ["add-on", "addon", "game", "jigsaw"],
	"question-mark-circle": ["help"],
	scale: ["balance", "weigh"],
	scissors: ["cut"],
	"shield-check": ["secure", "shield-tick"],
	"shield-exclamation": ["shield-error", "shield-warning"],
	"shopping-bag": ["cart"],
	sparkles: ["glitter", "stars"],
	"speaker-wave": ["audio", "loud", "sound", "unmute", "volume"],
	"speaker-x-mark": ["audio", "mute", "quiet", "sound", "volume"],
	star: ["achievement", "favorite", "rating", "score"],
	sun: ["brightness", "day", "light"],
	swatch: ["colors", "palette"],
	"table-cells": ["data", "grid", "spreadsheet"],
	tag: ["category", "group", "label"],
	trash: ["bin", "delete", "garbage", "remove", "rubbish"],
	truck: ["lorry", "vehicle"],
	user: ["account", "person", "profile"],
	"user-circle": ["account", "person", "profile"],
	"user-plus": ["account", "person", "profile", "user-add"],
	"user-minus": [
		"account",
		"person",
		"profile",
		"user-delete",
		"user-remove",
	],
	"video-camera": ["movie", "record"],
	"video-camera-slash": ["movie", "record", "stop"],
	wifi: ["connection", "online", "signal", "wireless"],
	wrench: ["options", "settings", "tool"],
	"wrench-screwdriver": ["options", "settings", "tool"],
	"x-circle": ["cancel", "close", "delete", "remove", "stop"],
	"x-mark": ["cancel", "close", "delete", "remove", "stop"],
};

const getIcon = (path, react, filled) => {
	if (react)
		return `<svg className="size-6" viewBox="0 0 24 24" ${
			filled
				? 'fill="currentColor"'
				: 'strokeWidth={1.5} stroke="currentColor"'
		}>\n\t<path ${
			filled ? "" : 'strokeLinecap="round" strokeLinejoin="round"'
		} d="${path}" />\n</svg>`;

	return `<svg class="size-6" viewBox="0 0 24 24" ${
		filled
			? 'fill="currentColor"'
			: 'fill="none" stroke-width="1.5" stroke="currentColor"'
	}>\n\t<path ${
		filled ? "" : 'stroke-linecap="round" stroke-linejoin="round"'
	} d="${path}" />\n</svg>`;
};

registerDataSource("crawler", "heroIcons", {
	url: "https://heroicons.com/",
	matcher:
		"main [role='tabpanel']:first-child .grid:first-child .group => name::div:last-child|icon::svg::outerHTML|path::svg path::d",
	mapEntry: (entry) => {
		const icon = getIcon(entry.path, false);
		const reactIcon = getIcon(entry.path, true);

		return {
			...entry,
			icon,
			subtitle: entry.name?.replaceAll("-", " ").replaceAll("_", " "),
			tags: heroiconTags[entry.name],
			...(onDesktop()
				? {
						url: `crotchet://copy/${reactIcon}`,
						onDoubleClick: () => openUrl(`crotchet://copy/${icon}`),
				  }
				: {
						url: `crotchet://copy/${icon}`,
						onHold: () =>
							openUrl(
								`crotchet://action-sheet/copyHeroIcon/?${objectToQueryParams(
									objectTake(entry, ["name", "path"])
								)}`
							),
				  }),
		};
	},
	layoutProps: {
		layout: "grid",
		// iconOnly: true,
		columns: "xs:3,md:5",
	},
	// fieldMap: {
	// 	// subtitle: "name|cleanString",
	// 	// url: "crotchet://copy/icon",
	// },
	icon: `<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
		</svg>`,
});

registerActionSheet(
	"copyHeroIcon",
	async ({ name, path }, { copyToClipboard }) => {
		return {
			// title: subtitle,
			preview: {
				title: "Copy Hero Icon",
				description: name?.replaceAll("-", " ").replaceAll("_", " "),
				icon: `
					<svg class="size-6" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="${path}" />
					</svg>
					`,
			},
			actions: [
				[true, false],
				[false, false],
				[true, true],
				[false, true],
				[false, false, true],
			].map(([react, filled, pathOnly]) => {
				const group = pathOnly ? "Path" : filled ? "Filled" : "Outline";

				return {
					group,
					icon: react ? (
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
						</svg>
					) : (
						<svg
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
							/>
						</svg>
					),
					label: pathOnly
						? "Copy icon path"
						: `Copy ${group.toLowerCase()} ${
								react ? "JSX" : "SVG"
						  } icon`,
					handler: () =>
						copyToClipboard(
							pathOnly ? path : getIcon(path, react, filled),
							{
								message: "Icon copied",
							}
						),
				};
			}),
		};
	}
);

registerAction("searchHeroicons", {
	type: "search",
	url: `crotchet://search/heroIcons`,
	tags: ["svg", "icon", "search"],
});

export default function HeroIconsWidget() {
	const { dataSources } = useAppContext();

	return (
		<DataWidget
			layout="grid"
			columns={8}
			iconOnly
			source={dataSources.heroIcons}
			widgetProps={{
				icon: (
					<svg
						className="w-3.5"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
					</svg>
				),
				title: "Heroicons",
				actions: [
					{
						icon: "search",
						label: "search",
						url: "crotchet://action/searchHeroicons",
					},
				],
			}}
		/>
	);
}
