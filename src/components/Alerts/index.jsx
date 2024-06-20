import { Children, cloneElement } from "react";
import Button from "@/components/Button";
import Modal, { MessageModal } from "../Modal";
import useAlerts from "./useAlerts";

export default function AlertsWrapper() {
	const {
		alerts,
		showAlert,
		confirmAction,
		confirmDangerousAction,
		openActionDialog,
	} = useAlerts();

	Object.assign(window, {
		showAlert,
		confirmAction,
		confirmDangerousAction,
		openActionDialog,
	});

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
		<>
			{alerts.map((alert) => {
				const props = {
					showOverlayBg: alert.showOverlayBg,
					hideCloseButton: alert.hideCloseButton,
					isOpen: alert.open,
					size: alert.size,
					invisible: alert.hidden,
					onClose: () => alert.close(),
				};

				if (alert.content) {
					return (
						<Modal
							dismissible={alert.dismissible ?? true}
							key={alert.id}
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
		</>
	);
}
