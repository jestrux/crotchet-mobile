import { Button } from "@chakra-ui/react";
import { Children, cloneElement, useRef } from "react";
import useAlerts from "@/components/Alerts/useAlerts";
import CommandKey from "@/components/CommandKey";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import { isValidAction, showToast } from "@/utils";
import { onActionClick } from "@/crotchet";
import SpotLightPageMenu from "./SpotLightPageMenu";

export default function ActionPage({ page, children }) {
	const {
		pageData,
		pageLoading,
		onContextMenuClick,
		onActionMenuClick,
		onSecondaryActionClick,
		onMainActionClick,
		setMainAction,
		mainAction,
		secondaryAction,
		actions,
	} = useSpotlightPageContext();
	const { confirm } = useAlerts();
	const actionsButtonRef = useRef();

	const onSubmit = (callback) => {
		setMainAction({
			handler: callback,
		});
	};

	const handleSecondaryAction = (payload) => {
		return onActionClick(secondaryAction, { confirm })(payload);
	};

	const handleMainAction = (payload) => {
		return onActionClick(mainAction, { confirm })(payload);
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
		handleMainAction({ page, pageData });
	});

	const mainActionSet = () => {
		return typeof isValidAction(mainAction);
	};

	const renderSecondaryContent = () => {
		if (secondaryAction) {
			return (
				<Button
					className="gap-1"
					rounded="md"
					size="sm"
					variant="ghost"
					colorScheme={secondaryAction.destructive && "red"}
					onClick={() => handleSecondaryAction({ page, pageData })}
				>
					<span className="mr-0.5 capitalize text-sm">
						{secondaryAction.label}
					</span>
					<CommandKey label="Cmd" />
					<CommandKey label="T" />
				</Button>
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
				})
			)}

			<div className="mx-0.5 mb-0.5 rounded-b-xl bg-card fixed bottom-0 inset-x-0 h-11 px-3 flex gap-4 items-center border-t z-10">
				{!pageLoading && (
					<>
						<div className="flex-1 flex items-center gap-4">
							{renderSecondaryContent()}
						</div>

						{mainActionSet() && (
							<Button
								className="gap-1"
								onClick={() =>
									handleMainAction({ page, pageData })
								}
								rounded="md"
								size="sm"
								variant="ghost"
							>
								<span className="mr-0.5 capitalize text-sm">
									{mainAction?.label || "Submit"}
								</span>
								<CommandKey label={mainAction.shortcut} />
							</Button>
						)}

						{mainActionSet() && actions?.length > 0 && (
							<div className="h-full border-l-2 border-content/15 max-h-5"></div>
						)}

						{actions?.length > 0 && (
							<SpotLightPageMenu
								width="250px"
								plain
								choices={actions}
								onChange={(value) => {
									if (!value) return;

									const action = actions.find((action) =>
										[
											action,
											action?.label,
											action?.value,
										].includes(value)
									);

									if (action) {
										console.log(
											"On menu action click: ",
											action
										);
										onActionClick(action)(
											{ pageData },
											window.__crotchet
										);
									}
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
					</>
				)}
			</div>
		</>
	);
}
