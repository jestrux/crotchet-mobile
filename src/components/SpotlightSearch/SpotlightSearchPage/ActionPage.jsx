import { Button } from "@chakra-ui/react";
import { Children, cloneElement, useRef } from "react";
import CommandKey from "@/components/CommandKey";
import useAlerts from "@/components/Alerts/useAlerts";
import { useSpotlightContext } from "../SpotlightContext";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import Menu from "@/components/Menu";
import { showToast } from "@/utils";
import { onActionClick } from "@/crotchet";

const getFallbackSecondaryActionHandler = ({ page, confirm }) => {
	let handler = () => {};

	if (typeof page.secondaryAction?.handler == "function") {
		const pageSecondaryActionHandler = page.secondaryAction.handler;

		handler = async (payload) => {
			if (page.secondaryAction?.destructive) {
				const res = await confirm({
					title: page.secondaryAction.label + "?",
					actionType: "danger",
					okayText:
						page.secondaryAction.confirmText || "Yes, Continue",
				});

				if (!res) return;
			}

			return await pageSecondaryActionHandler(payload);
		};
	}

	return handler;
};

const getFallbackActionHandler = ({ page }) => {
	if (typeof page.action?.handler == "function") {
		return async (payload) => {
			if (page.action?.destructive) {
				const res = await confirm({
					title: page.action.label + "?",
					actionType: "danger",
					okayText: page.action.confirmText || "Yes, Continue",
				});

				if (!res) return;
			}

			return page.action?.handler(payload);
		};
	}

	return null;
};

export default function ActionPage({ page, children }) {
	const { popCurrentSpotlightPage } = useSpotlightContext();
	const {
		pageData,
		onContextMenuClick,
		onActionMenuClick,
		onSecondaryActionClick,
		onMainActionClick,
	} = useSpotlightPageContext();
	const { confirm } = useAlerts();
	const actionsButtonRef = useRef();
	const secondaryActionButtonRef = useRef();
	const submitHandler = useRef(
		getFallbackActionHandler({
			page,
			popCurrentSpotlightPage,
		})
	);
	const secondaryActionHandler = useRef(
		getFallbackSecondaryActionHandler({
			page,
			confirm,
		})
	);
	const onSubmit = (callback) => {
		submitHandler.current = callback;
	};
	const handleSubmit = (payload) => {
		if (typeof submitHandler.current == "function")
			submitHandler.current(payload);
	};

	const handleSecondaryAction = (payload) => {
		if (typeof secondaryActionHandler.current == "function")
			secondaryActionHandler.current(payload);
		else showToast("Secondary action");
	};

	onContextMenuClick(() => {
		showToast("Context menu shortcut clicked");
	});

	onActionMenuClick(() => {
		if (actionsButtonRef.current) actionsButtonRef.current.click();
	});

	onSecondaryActionClick(() => {
		handleSecondaryAction({ page, pageData });
	});

	onMainActionClick(() => {
		handleSubmit({ page, pageData });
	});

	const renderSecondaryContent = () => {
		if (page?.secondaryAction) {
			return (
				<div
					className={
						typeof submitHandler.current != "function"
							? "ml-auto"
							: ""
					}
				>
					{page?.secondaryAction && (
						<Button
							ref={secondaryActionButtonRef}
							className="gap-1"
							rounded="md"
							size="sm"
							variant="ghost"
							colorScheme={
								page.secondaryAction.destructive && "red"
							}
							onClick={() =>
								handleSecondaryAction({ page, pageData })
							}
						>
							<span className="mr-0.5 capitalize text-sm">
								{page.secondaryAction.label}
							</span>
							<CommandKey label="Cmd" />
							<CommandKey label="T" />
						</Button>
					)}
				</div>
			);
		}

		return (
			<div className="flex items-center gap-2">
				<div
					className="size-5 flex center-center rounded"
					style={{
						background: "linear-gradient(45deg, #d3ffff, #f2ddb0)",
						color: "#3E3215",
						borderColor: "transparent",
					}}
				>
					<svg
						className="size-3"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.8}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
						/>
					</svg>
				</div>
				<span className="text-sm opacity-70">Crotchet</span>
			</div>
		);
	};

	return (
		<>
			{Children.map(children, (child) =>
				cloneElement(child, {
					page,
					onSubmit,
					// onSecondaryAction,
				})
			)}

			{/* {(typeof submitHandler.current == "function" ||
				page?.secondaryAction?.label?.length) && (
			)} */}

			<div className="mx-0.5 rounded-b-xl bg-card fixed bottom-0 inset-x-0 h-11 px-3 flex gap-4 items-center border-t z-10">
				<div className="flex-1 flex items-center gap-4">
					{renderSecondaryContent()}
				</div>

				{typeof submitHandler.current == "function" && (
					<Button
						className="gap-1"
						onClick={() => handleSubmit({ page, pageData })}
						rounded="md"
						size="sm"
						variant="ghost"
					>
						<span className="mr-0.5 capitalize text-sm">
							{page?.action?.label || page?.action || "Submit"}
						</span>

						<CommandKey label="Cmd" />
						<CommandKey label="Enter" />
					</Button>
				)}

				{typeof submitHandler.current == "function" && page.actions && (
					<div className="h-full border-l-2 border-content/15 max-h-5"></div>
				)}

				{page?.actions?.length && (
					<Menu
						plain
						choices={page.actions}
						onChange={(value) => {
							if (!value) return;

							const action = page.actions.find((action) =>
								[action, action?.label, action?.value].includes(
									value
								)
							);

							if (action) onActionClick(action)({ pageData });
						}}
						trigger={
							<Button
								as="div"
								ref={actionsButtonRef}
								className="gap-1 w-auto"
								rounded="md"
								size="sm"
								variant="ghost"
							>
								<span className="mr-0.5 capitalize text-sm">
									Actions
								</span>
								<CommandKey label="Cmd" />
								<CommandKey label="K" />
							</Button>
						}
					/>
				)}
			</div>
		</>
	);
}
