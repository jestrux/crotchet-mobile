import { Children, cloneElement, useRef } from "react";
import Modal, { MessageModal } from "@/components/Modal";
import Button from "@/components/Button";
import { isReactComponent, objectFieldChoices } from "@/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useOnInit } from "@/crotchet";
import Sheet from "./Sheet";
import useAlerts from "./useAlerts";
import Form from "../Form";

const ToastMessage = ({ message, onClose, duration = 3000 }) => {
	const toastTimerRef = useRef();

	useOnInit(() => {
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

		toastTimerRef.current = setTimeout(() => {
			onClose(null);
		}, duration);
	}, []);

	return (
		<div
			className="fixed inline-flex items-center top-14 py-2 px-3.5 z-[999999] bg-content/95 text-on-content text-sm drop-shadow-sm rounded-full -translate-x-1/2 left-1/2"
			style={{
				marginTop: "env(safe-area-inset-top)",
			}}
		>
			{message}
		</div>
	);
};

export default function AlertsWrapper() {
	const { alerts, ...alertThings } = useAlerts();

	Object.assign(window, alertThings);

	function renderActions(alert) {
		if (!alert.actions?.length) return;

		return (
			<div className="w-full flex gap-2">
				<Button
					variant="outline"
					className="flex-1"
					size="sm"
					onClick={() => alert.close(alert.actions[0])}
				>
					{alert.actions[0]}
				</Button>

				<Button
					className="flex-1"
					size="sm"
					color={alert.dangerous ? "danger" : null}
					onClick={() => alert.close(alert.actions[1])}
				>
					{alert.actions[1]}
				</Button>
			</div>
		);
	}

	return (
		<ErrorBoundary className="py-32 z-50">
			{alerts.map((alert) => {
				const props = {
					showOverlayBg: alert.showOverlayBg,
					hideCloseButton: alert.hideCloseButton,
					isOpen: alert.open,
					size: alert.size,
					invisible: alert.hidden,
					onClose: () => alert.close(),
				};

				if (alert.type == "toast") {
					return (
						<ToastMessage
							key={alert.id}
							message={alert.message}
							onClose={(data) => alert.close(data)}
						/>
					);
				}

				if (alert.type == "sheet") {
					return (
						<Sheet
							key={alert.id}
							{...alert}
							onClose={(data) => alert.close(data)}
						>
							{Children.map(alert.content, (child) => {
								return !isReactComponent(child)
									? child
									: cloneElement(child, {
											dismiss: alert.close,
											onClose: alert.close,
									  });
							})}
						</Sheet>
					);
				}

				if (alert.type == "choice-picker") {
					return (
						<Sheet
							key={alert.id}
							inset
							noHeading={!alert?.title?.length}
							onClose={alert.close}
							actions={objectFieldChoices(alert.choices)}
						/>
					);
				}

				if (alert.type == "form") {
					alert.content = (
						<div className="mx-px px-4 pt-3 pb-6">
							<Form
								data={alert.data}
								fields={alert.fields}
								field={alert.field}
								action={alert.action}
								onSubmit={async (values) => {
									values = _.keys(values).includes(
										"formField"
									)
										? values.formField
										: values;

									if (alert.action?.handler) {
										try {
											const res =
												await alert.action?.handler(
													values
												);
											if (!res)
												return console.log(
													"No return..."
												);

											alert.close(res);
										} catch (error) {
											window.showAlert(error);
											return;
										}
									}

									alert.close(values);
								}}
							/>
						</div>
					);
				}

				if (alert.content) {
					return (
						<Modal
							dismissible={alert.dismissible ?? true}
							key={alert.id}
							title={alert.title}
							{...props}
						>
							{Children.map(alert.content, (child) =>
								cloneElement(child, { onClose: alert.close })
							)}
						</Modal>
					);
				}

				return (
					<MessageModal
						key={alert.id}
						{...props}
						title={alert.title}
						message={alert.message}
						actions={renderActions(alert)}
					/>
				);
			})}
		</ErrorBoundary>
	);
}
