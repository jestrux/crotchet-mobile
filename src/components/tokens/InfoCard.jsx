export default function InfoCard({ children, infoIcon }) {
	return (
		<div
			className="flex items-start px-12px text bg-light-gray"
			style={{
				fontSize: "11px",
				lineHeight: 1.3,
				paddingTop: "0.4rem",
				paddingBottom: "0.5rem",
				gap: "0.3rem",
			}}
		>
			{infoIcon ? (
				<svg
					className="flex-shrink-0 opacity-50"
					width="16px"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
						clipRule="evenodd"
					/>
				</svg>
			) : (
				<svg
					className="flex-shrink-0 text-primary"
					width="16px"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.6}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002"
					/>
				</svg>

				// <svg
				// 	className="flex-shrink-0 text-primary"
				// 	width="16px"
				// 	viewBox="0 0 24 24"
				// 	fill="currentColor"
				// >
				// 	<path d="M10.5 1.875a1.125 1.125 0 012.25 0v8.219c.517.162 1.02.382 1.5.659V3.375a1.125 1.125 0 012.25 0v10.937a4.505 4.505 0 00-3.25 2.373 8.963 8.963 0 014-.935A.75.75 0 0018 15v-2.266a3.368 3.368 0 01.988-2.37 1.125 1.125 0 011.591 1.59 1.118 1.118 0 00-.329.79v3.006h-.005a6 6 0 01-1.752 4.007l-1.736 1.736a6 6 0 01-4.242 1.757H10.5a7.5 7.5 0 01-7.5-7.5V6.375a1.125 1.125 0 012.25 0v5.519c.46-.452.965-.832 1.5-1.141V3.375a1.125 1.125 0 012.25 0v6.526c.495-.1.997-.151 1.5-.151V1.875z" />
				// </svg>
			)}

			<div style={{ lineHeight: 1.5 }}>
				{children
					? children
					: "Click or drag and drop to add to canvas"}
			</div>
		</div>
	);
}
