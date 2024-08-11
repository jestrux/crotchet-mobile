import { dispatch, randomId } from "@/utils";
import { useState } from "react";

export default function useAlerts() {
	const [alerts, setAlerts] = useState([]);

	const notifyParent = (newValue, id, status) => {
		window.alerts = newValue;
		setTimeout(() => {
			dispatch("alerts-changed");
		}, 10);

		const spotlightParent = document.querySelector("[data-current-page]");

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
		setAlerts((alerts) => {
			const newValue = alerts.filter(({ id }) => id !== alertId);
			notifyParent(newValue, alertId, false);
			return newValue;
		});
	};

	const showAlert = (alert) => {
		alert = typeof alert == "string" ? { message: alert } : alert;
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

			const newValue = [...currentValue, alert];
			notifyParent(newValue, id, false);
			return newValue;
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

	const openActionSheet = (userProps = {}) =>
		showAlert({
			...userProps,
			type: "sheet",
		});

	const openChoicePicker = (props) =>
		showAlert({
			...(_.isArray(props) ? { choices: props } : props),
			type: "choice-picker",
		});

	const openAlertForm = (props) =>
		showAlert({
			...props,
			type: "form",
		});

	const showToast = (...message) =>
		showAlert({
			message: [...message].join(" "),
			type: "toast",
		});

	return {
		alerts,
		confirmAction,
		confirmDangerousAction,
		showAlert,
		hideAlert,
		openActionDialog,
		openActionSheet,
		openChoicePicker,
		openAlertForm,
		showToast,
	};
}
