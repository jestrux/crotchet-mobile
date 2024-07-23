import { useState } from "react";
import { dispatch, randomId } from "@/utils";

export default function useAlerts() {
	const [alerts, setAlerts] = useState([]);

	const notifyParent = (id, status) => {
		const spotlightParent = document.querySelector(
			"[data-current-spotlight-page]"
		);

		if (!spotlightParent) return console.log("No parent found!!");

		if (status) spotlightParent.classList.add(`alert-open-${id}`);
		else {
			setTimeout(() => {
				spotlightParent.classList.remove(`alert-open-${id}`);
				dispatch("alert-closed");
			}, 300);
		}
	};

	const hideAlert = (alertId) => {
		setAlerts((alerts) => alerts.filter(({ id }) => id !== alertId));
		notifyParent(alertId, false);
	};

	const showAlert = (alert) => {
		const promise = new Promise((resolve) => {
			const oldCallback = alert.callback || ((data) => data);
			alert.callback = (data) => resolve(oldCallback(data));
		});

		const id = randomId();

		alert = {
			...alert,
			id,
			open: true,
			close(data) {
				alert.callback(data);
				hideAlert(alert.id);
			},
		};

		if (alert.replace) alerts.at(-1)?.callback();

		setAlerts((alerts) => {
			const currentValue = !alert.replace
				? alerts
				: alerts.filter(({ id }) => id !== alerts.at(-1)?.id);

			notifyParent(id, true);

			return [...currentValue, alert];
		});

		if (typeof alert.onCreate == "function") alert.onCreate(alert);

		return promise;
	};

	function openActionDialog(props) {
		const defaultProps = {
			title: "",
			type: "form",
			action: "Submit",
			successMessage: "Success",
		};

		return showAlert({
			hideCloseButton: !!props?.title?.length,
			...(props.dialogProps ?? {}),
			content: { ...defaultProps, ...props },
		});
	}

	function confirmAction(userProps = {}) {
		const alert = {
			type: "confirm",
			size: "xs",
			title: "Are you sure?",
			message: "This action can not be undone",
			cancelText: "Cancel",
			okayText: "Yes, Continue",
			...(userProps || {}),
			hideCloseButton: true,
		};

		alert.actions = [alert.cancelText, alert.okayText];
		alert.callback = (action) => action === alert.okayText;

		return showAlert(alert);
	}

	function confirmDangerousAction() {
		return confirmAction({ dangerous: true });
	}

	return {
		alerts,
		confirmAction,
		confirmDangerousAction,
		showAlert,
		hideAlert,
		openActionDialog,
	};
}
