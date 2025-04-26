import React, { useState } from "react";
import {
	Box,
	Button,
	Typography,
	Paper,
	Alert,
	CircularProgress,
	Divider,
	Switch,
	FormControlLabel,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
} from "@mui/material";
import {
	subscribePageToWebhook,
	unsubscribePageFromWebhook,
} from "@/services/facebookServices";

interface WebhookManagerProps {
	pageId: string;
	pageName: string;
	isSubscribed?: boolean;
	onUpdate?: () => void;
}

const WebhookManager: React.FC<WebhookManagerProps> = ({
	pageId,
	pageName,
	isSubscribed = false,
	onUpdate,
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [subscriptionStatus, setSubscriptionStatus] =
		useState<boolean>(isSubscribed);
	const [openUnsubscribeDialog, setOpenUnsubscribeDialog] =
		useState<boolean>(false);
	const [appId, setAppId] = useState<string>("");

	const handleSubscribe = async () => {
		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const response = await subscribePageToWebhook(pageId);

			if (response && !response.error) {
				setSubscriptionStatus(true);
				setSuccess(`Successfully subscribed "${pageName}" to webhook`);
				if (onUpdate) onUpdate();
			} else {
				setError(response.error?.message || "Failed to subscribe to webhook");
			}
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleUnsubscribe = async () => {
		if (!appId.trim()) {
			setError("App ID is required for unsubscribing");
			return;
		}

		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const response = await unsubscribePageFromWebhook(pageId, appId);

			if (response && !response.error) {
				setSubscriptionStatus(false);
				setSuccess(`Successfully unsubscribed "${pageName}" from webhook`);
				setOpenUnsubscribeDialog(false);
				if (onUpdate) onUpdate();
			} else {
				setError(
					response.error?.message || "Failed to unsubscribe from webhook"
				);
			}
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper elevation={2} sx={{ p: 3, mb: 3 }}>
			<Typography variant="h6" gutterBottom>
				Facebook Page Webhook Manager
			</Typography>

			<Divider sx={{ my: 2 }} />

			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle1">Page: {pageName}</Typography>
				<Typography variant="body2" color="text.secondary">
					ID: {pageId}
				</Typography>
			</Box>

			<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
				<FormControlLabel
					control={
						<Switch
							checked={subscriptionStatus}
							onChange={(e) => {
								if (!e.target.checked) {
									setOpenUnsubscribeDialog(true);
								} else {
									handleSubscribe();
								}
							}}
							disabled={loading}
						/>
					}
					label={
						subscriptionStatus ? "Subscribed to webhook" : "Not subscribed"
					}
				/>

				{loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			{success && (
				<Alert severity="success" sx={{ mb: 2 }}>
					{success}
				</Alert>
			)}

			<Box sx={{ mt: 3 }}>
				<Typography variant="body2" color="text.secondary">
					When subscribed, your Facebook page will send lead data to your
					application whenever a new lead is generated.
				</Typography>
			</Box>

			{/* Unsubscribe Dialog */}
			<Dialog
				open={openUnsubscribeDialog}
				onClose={() => setOpenUnsubscribeDialog(false)}
			>
				<DialogTitle>Unsubscribe from Webhook</DialogTitle>
				<DialogContent>
					<DialogContentText>
						To unsubscribe this page from the webhook, please enter the Facebook
						App ID. This is required by Facebook to complete the unsubscription
						process.
					</DialogContentText>
					<TextField
						autoFocus
						margin="dense"
						id="appId"
						label="Facebook App ID"
						type="text"
						fullWidth
						variant="outlined"
						value={appId}
						onChange={(e) => setAppId(e.target.value)}
						sx={{ mt: 2 }}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setOpenUnsubscribeDialog(false)}
						color="primary"
					>
						Cancel
					</Button>
					<Button
						onClick={handleUnsubscribe}
						color="primary"
						variant="contained"
						disabled={!appId.trim() || loading}
					>
						{loading ? <CircularProgress size={24} /> : "Unsubscribe"}
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
};

export default WebhookManager;
