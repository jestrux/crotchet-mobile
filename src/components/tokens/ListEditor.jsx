import React from "react";
import Toggle from "./Toggle";

function ListEditor({ links, activeLink, onChange, onChangeActiveLink }) {
	const [linkBeingEdited, setLinkBeingEdited] = React.useState(null);
	function handleSetLinks(links) {
		onChange(links);
	}

	function handleLinkTextChanged(e) {
		e.preventDefault();
		const form = e.target;
		const newValue = form.elements[0].value;

		if (links[linkBeingEdited] != newValue) {
			const newLinks = [...links];
			newLinks.splice(linkBeingEdited, 1, newValue);

			const wasSelected = linkBeingEdited === links.indexOf(activeLink);
			onChange(newLinks, wasSelected ? newValue : null);
		} else setLinkBeingEdited(null);
	}

	function handleMoveLink(e, linkIndex) {
		const isLastItem = linkIndex === links.length - 1;
		const { shiftKey, altKey } = e;
		const leap = shiftKey ? 3 : 1;
		let newIndex =
			isLastItem || altKey ? linkIndex - leap : linkIndex + leap;

		// clamp
		newIndex = Math.max(0, Math.min(newIndex, links.length - 1));

		const newLinks = [...links];
		const link = newLinks.splice(linkIndex, 1)[0];
		newLinks.splice(newIndex, 0, link);

		onChange(newLinks);
	}

	return (
		<div className="pt-2 mt-3">
			<div className="flex items-center justify-between px-3">
				<label className="text-md">Links</label>

				<Toggle checked={links} onChange={handleSetLinks} />
			</div>

			{links && (
				<div className="-mx-12pxs mt-1">
					<div className="bg-white">
						{links.map((link, index) => {
							const selected = activeLink === link;
							const editting = linkBeingEdited === index;

							return (
								<div
									key={index}
									className={`parent bg-white py-2 px-3 border-b border-light-gray flex items-center ${
										selected ? "text-blue" : ""
									}`}
								>
									<div
										className={`mr-2 rounded-full border ${
											selected
												? "bg-blue border-blue"
												: "border-dark-gray cursor-pointer"
										}`}
										style={{
											width: "10px",
											height: "10px",
										}}
										onClick={() =>
											selected
												? null
												: onChangeActiveLink(link)
										}
									></div>

									{editting && (
										<form
											action="#"
											className="flex-1 bg-gray"
											onSubmit={handleLinkTextChanged}
										>
											<input
												autoFocus
												className="w-full"
												defaultValue={link}
												name="link"
												uxp-quiet="true"
												onKeyDown={(e) =>
													e.key == "Escape"
														? setLinkBeingEdited(
																null
														  )
														: null
												}
											/>
										</form>
									)}

									{!editting && (
										<React.Fragment>
											<h5
												className="flex-1 text-base font-normal cursor-pointer"
												onClick={() =>
													setLinkBeingEdited(index)
												}
											>
												{link}
											</h5>

											<div
												className="visible-on-parent-hover cursor-pointer rounded-full bg-light-gray flex center-center"
												style={{
													width: "20px",
													height: "20px",
												}}
												onClick={(e) =>
													handleMoveLink(e, index)
												}
											>
												<svg
													width="14px"
													height="14px"
													viewBox="0 0 24 24"
												>
													<polygon points="13,6.99 16,6.99 12,3 8,6.99 11,6.99 11,17.01 8,17.01 12,21 16,17.01 13,17.01" />
												</svg>
											</div>
										</React.Fragment>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

export default ListEditor;
