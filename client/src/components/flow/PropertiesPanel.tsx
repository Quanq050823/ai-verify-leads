import React, { useState, useEffect } from "react";
import { Node } from "@xyflow/react";
import {
	Box,
	Paper,
	Typography,
	TextField,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	IconButton,
	Divider,
	Chip,
	styled,
	SelectChangeEvent,
	CircularProgress,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Alert,
	Tooltip,
} from "@mui/material";
import {
	Close,
	NotificationImportant,
	Refresh,
	Add,
	Call,
	Remove,
} from "@mui/icons-material";
import {
	useFacebookConnections,
	useFacebookPages,
	useFacebookForms,
	subscribePageToWebhook,
	unsubscribePageFromWebhook,
	openFacebookConnect,
} from "@/services/facebookServices";
import {
	useGoogleCalendarConnections,
	openGoogleCalendarConnect,
} from "@/services/googleCalendarServices";
import { toast } from "react-toastify";
import { callLead, LeadData } from "@/services/flowServices";

type PropertiesPanelProps = {
	selectedNode: Node | null;
	onChange: (id: string, data: any) => void;
	onClose: () => void;
};

interface NodeSettings {
	spreadsheetId?: string;
	sheetName?: string;
	adAccountId?: string;
	campaignId?: string;
	apiProvider?: string;
	apiKey?: string;
	promptTemplate?: string;
	calendarId?: string;
	duration?: number;
	webhookUrl?: string;
	method?: string;
	field?: string;
	operator?: string;
	value?: string;
	provider?: string;
	subject?: string;
	template?: string;
	connectionId?: string;
	pageId?: string;
	formId?: string;
	phoneNumber?: string;
	callerNumber?: string;
	attributeJson?: string;
	language?: string;
	prompt?: string;
	introduction?: string;
	questions?: Array<string>;
	goodByeMessage?: string;
	calendarName?: string;
	eventName?: string;
	startWorkDays?: Array<string>;
	endWorkDays?: Array<string>;
	startTime?: string;
	endTime?: string;
	[key: string]: string | number | Array<string> | undefined;
}

const PanelContainer = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.background.paper,
	borderLeft: `1px solid ${theme.palette.divider}`,
	width: "380px",
	height: "100%",
	padding: theme.spacing(2),
	boxShadow: theme.shadows[2],
	zIndex: 10,
	overflow: "auto",
	animation: "slideInRight 0.3s ease-out",
	"@keyframes slideInRight": {
		from: { transform: "translateX(100%)" },
		to: { transform: "translateX(0)" },
	},
}));

const NodeInfoCard = styled(Box)(({ theme }) => ({
	padding: theme.spacing(1.5),
	backgroundColor: theme.palette.grey[50],
	borderRadius: theme.shape.borderRadius,
	marginBottom: theme.spacing(2),
}));

const NodeColorIndicator = styled(Box, {
	shouldForwardProp: (prop) => prop !== "bgcolor",
})<{ bgcolor: string }>(({ bgcolor }) => ({
	width: "16px",
	height: "16px",
	borderRadius: "50%",
	backgroundColor: bgcolor || "#94a3b8",
	marginRight: "8px",
}));

// Facebook Connection Select Component
interface ConnectionSelectProps {
	value: string;
	onChange: (value: string) => void;
}

const ConnectionSelect: React.FC<ConnectionSelectProps> = ({
	value,
	onChange,
}) => {
	const [refreshKey, setRefreshKey] = useState<number>(0);
	const [isConnecting, setIsConnecting] = useState<boolean>(false);
	const { connections, loading, error } = useFacebookConnections(refreshKey);

	const handleRefresh = () => {
		setRefreshKey((prevKey) => prevKey + 1);
	};

	const handleAddConnection = async () => {
		// Mở cửa sổ mới để kết nối Facebook
		setIsConnecting(true);

		try {
			const { popupWindow, error } = await openFacebookConnect();

			if (error) {
				setIsConnecting(false);
				return;
			}

			// Theo dõi trạng thái của cửa sổ popup
			const checkPopup = setInterval(() => {
				if (popupWindow?.closed) {
					clearInterval(checkPopup);
					setIsConnecting(false);
					handleRefresh();
				}
			}, 1000);
		} catch (err) {
			console.error("Error connecting to Facebook:", err);
			setIsConnecting(false);
		}
	};

	useEffect(() => {
		// Lắng nghe sự kiện từ cửa sổ popup khi kết nối hoàn tất
		const handleConnectionComplete = () => {
			if (isConnecting) {
				setTimeout(() => {
					handleRefresh();
				}, 1000);
			}
		};

		window.addEventListener("focus", handleConnectionComplete);

		return () => {
			window.removeEventListener("focus", handleConnectionComplete);
		};
	}, [isConnecting]);

	return (
		<>
			<FormControl fullWidth margin="normal" size="small">
				<InputLabel>Choose Facebook Connection</InputLabel>
				<Box sx={{ display: "flex", width: "100%" }}>
					<Select
						value={value}
						onChange={(e) => onChange(e.target.value)}
						label="Choose Facebook Connection"
						disabled={loading}
						sx={{ flex: 1 }}
					>
						{loading ? (
							<MenuItem value="">
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<CircularProgress size={20} sx={{ mr: 1 }} />
									Loading...
								</Box>
							</MenuItem>
						) : error ? (
							<MenuItem value="">Error: {error}</MenuItem>
						) : connections.length === 0 ? (
							<MenuItem
								key="add_new"
								value="add_new"
								onClick={(e) => {
									e.preventDefault(); // Ngăn chặn sự kiện chọn
									handleAddConnection();
								}}
								sx={{
									color: "primary.main",
									display: "flex",
									alignItems: "center",
								}}
							>
								{isConnecting ? (
									<>
										<CircularProgress size={20} sx={{ mr: 1 }} />
										Đang kết nối...
									</>
								) : (
									<>
										<Add fontSize="small" sx={{ mr: 1 }} />
										Thêm kết nối Facebook mới
									</>
								)}
							</MenuItem>
						) : (
							[
								...connections.map((connection) => (
									<MenuItem
										key={connection.profile.id}
										value={connection.profile.id}
									>
										{connection.profile.name}
									</MenuItem>
								)),
								<Divider key="divider" />,
								<MenuItem
									key="add_new"
									value="add_new"
									onClick={(e) => {
										e.preventDefault(); // Ngăn chặn sự kiện chọn
										handleAddConnection();
									}}
									sx={{
										color: "primary.main",
										display: "flex",
										alignItems: "center",
									}}
								>
									{isConnecting ? (
										<>
											<CircularProgress size={20} sx={{ mr: 1 }} />
											Đang kết nối...
										</>
									) : (
										<>
											<Add fontSize="small" sx={{ mr: 1 }} />
											Thêm kết nối Facebook mới
										</>
									)}
								</MenuItem>,
							]
						)}
					</Select>
					<Tooltip title="Refresh connections">
						<IconButton
							onClick={handleRefresh}
							size="small"
							sx={{ ml: 1 }}
							disabled={loading}
						>
							<Refresh fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			</FormControl>
		</>
	);
};

// Facebook Page Select Component
interface PageSelectProps {
	connectionId: string | undefined;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

const PageSelect: React.FC<PageSelectProps> = ({
	connectionId,
	value,
	onChange,
	disabled,
}) => {
	const [refreshKey, setRefreshKey] = useState<number>(0);
	const { pages, loading, error } = useFacebookPages(
		connectionId || null,
		refreshKey
	);

	const handleRefresh = () => {
		setRefreshKey((prevKey) => prevKey + 1);
	};

	return (
		<FormControl fullWidth margin="normal" size="small" disabled={disabled}>
			<InputLabel>Choose Facebook Page</InputLabel>
			<Box sx={{ display: "flex", width: "100%" }}>
				<Select
					value={value}
					onChange={(e) => onChange(e.target.value)}
					label="Choose Facebook Page"
					disabled={loading || disabled}
					sx={{ flex: 1 }}
				>
					{loading ? (
						<MenuItem value="">
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<CircularProgress size={20} sx={{ mr: 1 }} />
								Loading...
							</Box>
						</MenuItem>
					) : error ? (
						<MenuItem value="">Error: {error}</MenuItem>
					) : pages.length === 0 ? (
						<MenuItem value="">No Facebook pages found</MenuItem>
					) : (
						pages.map((page) => (
							<MenuItem key={page.id} value={page.id}>
								{page.name}
							</MenuItem>
						))
					)}
				</Select>
				<Tooltip title="Refresh pages">
					<IconButton
						onClick={handleRefresh}
						size="small"
						sx={{ ml: 1 }}
						disabled={loading || disabled}
					>
						<Refresh fontSize="small" />
					</IconButton>
				</Tooltip>
			</Box>
		</FormControl>
	);
};

// Facebook Form Select Component
interface FormSelectProps {
	pageId: string | undefined;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
	pageId,
	value,
	onChange,
	disabled,
}) => {
	const [refreshKey, setRefreshKey] = useState<number>(0);
	const { forms, loading, error } = useFacebookForms(
		pageId || null,
		refreshKey
	);

	const handleRefresh = () => {
		setRefreshKey((prevKey) => prevKey + 1);
	};

	return (
		<FormControl fullWidth margin="normal" size="small" disabled={disabled}>
			<InputLabel>Choose Lead Form</InputLabel>
			<Box sx={{ display: "flex", width: "100%" }}>
				<Select
					value={value}
					onChange={(e) => onChange(e.target.value)}
					label="Choose Lead Form"
					disabled={loading || disabled}
					sx={{ flex: 1 }}
				>
					{loading ? (
						<MenuItem value="">
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<CircularProgress size={20} sx={{ mr: 1 }} />
								Loading...
							</Box>
						</MenuItem>
					) : error ? (
						<MenuItem value="">Error: {error}</MenuItem>
					) : forms.length === 0 ? (
						<MenuItem value="">No lead forms found</MenuItem>
					) : (
						forms.map((form) => (
							<MenuItem key={form.id} value={form.id}>
								{form.name}
							</MenuItem>
						))
					)}
				</Select>
				<Tooltip title="Refresh forms">
					<IconButton
						onClick={handleRefresh}
						size="small"
						sx={{ ml: 1 }}
						disabled={loading || disabled}
					>
						<Refresh fontSize="small" />
					</IconButton>
				</Tooltip>
			</Box>
		</FormControl>
	);
};

// Add WebhookDialog component
interface WebhookDialogProps {
	open: boolean;
	onClose: () => void;
	pageId: string;
	pageName: string;
	isSubscribed: boolean;
	onUpdate: (subscribed: boolean) => void;
}

const WebhookDialog: React.FC<WebhookDialogProps> = ({
	open,
	onClose,
	pageId,
	pageName,
	isSubscribed,
	onUpdate,
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [appId, setAppId] = useState<string>("");
	const [showUnsubscribeForm, setShowUnsubscribeForm] =
		useState<boolean>(false);

	const handleSubscribe = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await subscribePageToWebhook(pageId);
			if (response && !response.error) {
				onUpdate(true);
				onClose();
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
			const response = await unsubscribePageFromWebhook(pageId, appId);
			if (response && !response.error) {
				onUpdate(false);
				onClose();
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
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				{isSubscribed ? "Webhook Subscription" : "Subscribe to Webhook"}
			</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<DialogContentText gutterBottom>
					{isSubscribed
						? `Page "${pageName}" is currently subscribed to webhook notifications.`
						: `Subscribe page "${pageName}" to webhook notifications to receive lead data in real-time.`}
				</DialogContentText>

				{isSubscribed && (
					<>
						<Box sx={{ mt: 2 }}>
							<Button
								variant="outlined"
								color="error"
								onClick={() => setShowUnsubscribeForm(true)}
								disabled={loading || showUnsubscribeForm}
							>
								Unsubscribe from Webhook
							</Button>
						</Box>

						{showUnsubscribeForm && (
							<Box sx={{ mt: 2 }}>
								<DialogContentText>
									To unsubscribe, please enter your Facebook App ID:
								</DialogContentText>
								<TextField
									autoFocus
									margin="dense"
									label="Facebook App ID"
									type="text"
									fullWidth
									value={appId}
									onChange={(e) => setAppId(e.target.value)}
								/>
							</Box>
						)}
					</>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					Cancel
				</Button>
				{isSubscribed ? (
					showUnsubscribeForm && (
						<Button
							onClick={handleUnsubscribe}
							color="error"
							variant="contained"
							disabled={loading || !appId.trim()}
						>
							{loading ? <CircularProgress size={24} /> : "Unsubscribe"}
						</Button>
					)
				) : (
					<Button
						onClick={handleSubscribe}
						color="primary"
						variant="contained"
						disabled={loading}
					>
						{loading ? <CircularProgress size={24} /> : "Subscribe"}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

// Add new WebhookSection component
interface WebhookSectionProps {
	pageId: string;
	connectionId?: string;
	isSubscribed: boolean;
	onUpdate: (subscribed: boolean) => void;
}

const WebhookSection: React.FC<WebhookSectionProps> = ({
	pageId,
	connectionId,
	isSubscribed,
	onUpdate,
}) => {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const { pages } = useFacebookPages(connectionId || null);
	const page = pages.find((p) => p.id === pageId);
	const pageName = page?.name || "Selected Page";

	return (
		<>
			<Box sx={{ mt: 2, mb: 1 }}>
				<Divider>
					<Chip label="Webhook Settings" />
				</Divider>
			</Box>

			<Box
				sx={{
					mt: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Chip
						size="small"
						label={isSubscribed ? "Subscribed" : "Not Subscribed"}
						color={isSubscribed ? "success" : "default"}
						sx={{ ml: 1 }}
					/>
				</Box>

				<Button
					startIcon={<NotificationImportant />}
					variant="outlined"
					size="small"
					onClick={() => setDialogOpen(true)}
				>
					Manage Webhook
				</Button>
			</Box>

			<WebhookDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				pageId={pageId}
				pageName={pageName}
				isSubscribed={isSubscribed}
				onUpdate={onUpdate}
			/>
		</>
	);
};

// Google Calendar Connection Select Component
interface CalendarConnectionSelectProps {
	value: string;
	onChange: (value: string) => void;
}

const CalendarConnectionSelect: React.FC<CalendarConnectionSelectProps> = ({
	value,
	onChange,
}) => {
	const [refreshKey, setRefreshKey] = useState<number>(0);
	const [isConnecting, setIsConnecting] = useState<boolean>(false);
	const { connections, loading, error } =
		useGoogleCalendarConnections(refreshKey);

	const handleRefresh = () => {
		setRefreshKey((prevKey) => prevKey + 1);
	};

	const handleAddConnection = async () => {
		// Mở cửa sổ mới để kết nối Google Calendar
		setIsConnecting(true);

		try {
			const { popupWindow, error } = await openGoogleCalendarConnect();

			if (error) {
				setIsConnecting(false);
				return;
			}

			// Theo dõi trạng thái của cửa sổ popup
			const checkPopup = setInterval(() => {
				if (popupWindow?.closed) {
					clearInterval(checkPopup);
					setIsConnecting(false);
					handleRefresh();
				}
			}, 1000);
		} catch (err) {
			console.error("Error connecting to Google Calendar:", err);
			setIsConnecting(false);
		}
	};

	useEffect(() => {
		// Lắng nghe sự kiện từ cửa sổ popup khi kết nối hoàn tất
		const handleConnectionComplete = () => {
			if (isConnecting) {
				setTimeout(() => {
					handleRefresh();
				}, 1000);
			}
		};

		window.addEventListener("focus", handleConnectionComplete);

		return () => {
			window.removeEventListener("focus", handleConnectionComplete);
		};
	}, [isConnecting]);

	return (
		<>
			<FormControl fullWidth margin="normal" size="small">
				<InputLabel>Google Calendar Connection</InputLabel>
				<Box sx={{ display: "flex", width: "100%" }}>
					<Select
						value={value}
						onChange={(e) => onChange(e.target.value)}
						label="Google Calendar Connection"
						disabled={loading}
						sx={{ flex: 1 }}
					>
						{loading ? (
							<MenuItem value="">
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<CircularProgress size={20} sx={{ mr: 1 }} />
									Loading...
								</Box>
							</MenuItem>
						) : error ? (
							<MenuItem value="">Error: {error}</MenuItem>
						) : connections.length === 0 ? (
							<MenuItem
								key="add_new"
								value="add_new"
								onClick={(e) => {
									e.preventDefault(); // Ngăn chặn sự kiện chọn
									handleAddConnection();
								}}
								sx={{
									color: "primary.main",
									display: "flex",
									alignItems: "center",
								}}
							>
								{isConnecting ? (
									<>
										<CircularProgress size={20} sx={{ mr: 1 }} />
										Đang kết nối...
									</>
								) : (
									<>
										<Add fontSize="small" sx={{ mr: 1 }} />
										Thêm kết nối Google Calendar mới
									</>
								)}
							</MenuItem>
						) : (
							[
								...connections.map((connection) => (
									<MenuItem
										key={connection.profile.id}
										value={connection.profile.id}
									>
										{connection.profile.name || connection.profile.email}
									</MenuItem>
								)),
								<Divider key="divider" />,
								<MenuItem
									key="add_new"
									value="add_new"
									onClick={(e) => {
										e.preventDefault(); // Ngăn chặn sự kiện chọn
										handleAddConnection();
									}}
									sx={{
										color: "primary.main",
										display: "flex",
										alignItems: "center",
									}}
								>
									{isConnecting ? (
										<>
											<CircularProgress size={20} sx={{ mr: 1 }} />
											Đang kết nối...
										</>
									) : (
										<>
											<Add fontSize="small" sx={{ mr: 1 }} />
											Thêm kết nối Google Calendar mới
										</>
									)}
								</MenuItem>,
							]
						)}
					</Select>
					<Tooltip title="Refresh connections">
						<IconButton
							onClick={handleRefresh}
							size="small"
							sx={{ ml: 1 }}
							disabled={loading}
						>
							<Refresh fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			</FormControl>
		</>
	);
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
	selectedNode,
	onChange,
	onClose,
}) => {
	const [localSettings, setLocalSettings] = useState<NodeSettings>({});
	const [isTestingCall, setIsTestingCall] = useState<boolean>(false);
	const [callResult, setCallResult] = useState<any>(null);
	const [openCallResultDialog, setOpenCallResultDialog] =
		useState<boolean>(false);

	if (!selectedNode) {
		return null;
	}

	// Initialize local settings if node changes
	useEffect(() => {
		if (selectedNode) {
			const nodeSettings = selectedNode.data?.settings || {};

			// Khởi tạo giá trị mặc định cho node aiCall mới
			if (
				selectedNode.type === "aiCall" &&
				Object.keys(nodeSettings).length === 0
			) {
				setLocalSettings({
					language: "english",
					prompt: "",
					introduction: "",
					questions: [""],
					goodByeMessage: "",
				});
			}
			// Khởi tạo giá trị mặc định cho node googleCalendar mới
			else if (
				selectedNode.type === "googleCalendar" &&
				Object.keys(nodeSettings).length === 0
			) {
				setLocalSettings({
					calendarName: "",
					eventName: "",
					startWorkDays: ["Monday"],
					endWorkDays: ["Friday"],
					startTime: "09:00",
					endTime: "17:00",
					duration: 30,
				});
			} else {
				setLocalSettings(nodeSettings as NodeSettings);
			}
		}
	}, [selectedNode]);

	const updateSettings = (
		key: string,
		value: string | number | Array<string>
	) => {
		const updatedSettings = { ...localSettings, [key]: value };
		setLocalSettings(updatedSettings);

		// Update the node data
		onChange(selectedNode.id, {
			...selectedNode.data,
			settings: updatedSettings,
		});
	};

	const handleTextChange =
		(key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
			updateSettings(key, event.target.value);
		};

	const handleSelectChange = (key: string) => (event: SelectChangeEvent) => {
		updateSettings(key, event.target.value);
	};

	const handleNumberChange =
		(key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
			updateSettings(key, parseInt(event.target.value) || 0);
		};

	// Add the function to handle test call
	const handleTestCall = async () => {
		if (!localSettings.phoneNumber || !localSettings.callerNumber) {
			toast.error("Vui lòng nhập số điện thoại và số người gọi!");
			return;
		}

		// Tạo attribute dựa trên các trường mới
		let attribute = {
			language: localSettings.language || "vietnamese",
			prompt: localSettings.prompt || "",
			introduction: localSettings.introduction || "",
			questions: localSettings.questions || [""],
			goodByeMessage: localSettings.goodByeMessage || "",
		};

		// Nếu có attributeJson, sử dụng nó thay thế
		if (localSettings.attributeJson) {
			try {
				attribute = JSON.parse(localSettings.attributeJson);
			} catch (error) {
				toast.error("Lỗi định dạng JSON cho trường attribute!");
				return;
			}
		}

		try {
			setIsTestingCall(true);
			const leadData: LeadData = {
				phoneNumber: localSettings.phoneNumber || "",
				callerId: "",
				callerNumber: localSettings.callerNumber || "",
				attribute: attribute,
				outreachType: "phonecall",
				ExtendData: {},
			};

			const result = await callLead(leadData);
			setCallResult(result);
			setOpenCallResultDialog(true);
		} catch (error) {
			console.error("Error testing call:", error);
			toast.error("Lỗi khi thực hiện cuộc gọi thử nghiệm!");
		} finally {
			setIsTestingCall(false);
		}
	};

	const renderSettings = () => {
		// Different node types have different settings
		const nodeType = selectedNode.type || "default";

		switch (nodeType) {
			case "googleSheets":
				return (
					<>
						<TextField
							fullWidth
							size="small"
							label="Spreadsheet ID"
							variant="outlined"
							margin="normal"
							value={localSettings.spreadsheetId || ""}
							onChange={handleTextChange("spreadsheetId")}
							placeholder="Enter spreadsheet ID"
						/>
						<TextField
							fullWidth
							size="small"
							label="Sheet Name"
							variant="outlined"
							margin="normal"
							value={localSettings.sheetName || ""}
							onChange={handleTextChange("sheetName")}
							placeholder="Enter sheet name"
						/>
					</>
				);

			case "facebookAds":
			case "facebookLeadAds":
				return (
					<>
						<ConnectionSelect
							value={localSettings.connectionId || ""}
							onChange={(value) => updateSettings("connectionId", value)}
						/>

						<PageSelect
							connectionId={localSettings.connectionId}
							value={localSettings.pageId || ""}
							onChange={(value) => updateSettings("pageId", value)}
							disabled={!localSettings.connectionId}
						/>

						<FormSelect
							pageId={localSettings.pageId}
							value={localSettings.formId || ""}
							onChange={(value) => updateSettings("formId", value)}
							disabled={!localSettings.pageId}
						/>

						{localSettings.pageId && (
							<Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
								<Button
									variant="contained"
									color="primary"
									startIcon={<NotificationImportant />}
									onClick={() => {
										toast.success("Facebook connection saved!");
										onChange(selectedNode.id, {
											...selectedNode.data,
											webhookSubscribed: true,
										});
									}}
								>
									Save Connection
								</Button>
							</Box>
						)}
					</>
				);

			case "aiCall":
				return (
					<>
						<FormControl fullWidth margin="normal" size="small">
							<InputLabel>Language</InputLabel>
							<Select
								value={localSettings.language || "vietnamese"}
								onChange={handleSelectChange("language")}
								label="Language"
							>
								<MenuItem value="vietnamese">Tiếng Việt</MenuItem>
								<MenuItem value="english">English</MenuItem>
							</Select>
						</FormControl>

						<TextField
							fullWidth
							size="small"
							label="Prompt"
							variant="outlined"
							margin="normal"
							multiline
							rows={2}
							value={localSettings.prompt || ""}
							onChange={handleTextChange("prompt")}
							placeholder="Enter prompt"
						/>

						<TextField
							fullWidth
							size="small"
							label="Introduction"
							variant="outlined"
							margin="normal"
							multiline
							rows={2}
							value={localSettings.introduction || ""}
							onChange={handleTextChange("introduction")}
							placeholder="Enter introduction message"
						/>

						<Box sx={{ mt: 2, mb: 1 }}>
							<Divider>
								<Chip label="Questions" />
							</Divider>
						</Box>

						{/* Render questions dynamically */}
						{(localSettings.questions || [""]).map((question, index) => (
							<Box
								key={index}
								sx={{ display: "flex", mb: 3, alignItems: "center" }}
							>
								<TextField
									fullWidth
									size="small"
									label={`Question ${index + 1}`}
									variant="outlined"
									value={question}
									onChange={(e) => {
										const newQuestions = [...(localSettings.questions || [""])];
										newQuestions[index] = e.target.value;
										updateSettings("questions", newQuestions);
									}}
								/>
								<Box sx={{ display: "flex", ml: 1 }}>
									{(localSettings.questions || [""]).length > 1 && (
										<IconButton
											size="small"
											color="error"
											onClick={() => {
												const newQuestions = [
													...(localSettings.questions || [""]),
												];
												newQuestions.splice(index, 1);
												updateSettings("questions", newQuestions);
											}}
										>
											<Close fontSize="small" />
										</IconButton>
									)}
								</Box>
							</Box>
						))}

						{/* Add question button */}
						<Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
							<Button
								variant="outlined"
								size="small"
								startIcon={<Add />}
								onClick={() => {
									const newQuestions = [
										...(localSettings.questions || [""]),
										"",
									];
									updateSettings("questions", newQuestions);
								}}
							>
								Thêm câu hỏi
							</Button>
						</Box>

						<TextField
							fullWidth
							size="small"
							label="Goodbye Message"
							variant="outlined"
							margin="normal"
							multiline
							rows={2}
							value={localSettings.goodByeMessage || ""}
							onChange={handleTextChange("goodByeMessage")}
							placeholder="Enter goodbye message"
						/>
					</>
				);

			case "googleCalendar":
				return (
					<>
						<CalendarConnectionSelect
							value={localSettings.connectionId || ""}
							onChange={(value) => updateSettings("connectionId", value)}
						/>

						<TextField
							fullWidth
							size="small"
							label="Calendar Name"
							variant="outlined"
							margin="normal"
							value={localSettings.calendarName || ""}
							onChange={handleTextChange("calendarName")}
							placeholder="Enter calendar name"
							required
						/>

						<TextField
							fullWidth
							size="small"
							label="Event Name"
							variant="outlined"
							margin="normal"
							value={localSettings.eventName || ""}
							onChange={handleTextChange("eventName")}
							placeholder="Enter event name"
						/>

						<Box sx={{ mt: 2, mb: 1 }}>
							<Divider>
								<Chip label="Working Days" />
							</Divider>
						</Box>

						<FormControl fullWidth margin="normal" size="small">
							<InputLabel>Start Work Day</InputLabel>
							<Select
								value={localSettings.startWorkDays?.[0] || "Monday"}
								onChange={(e) => {
									updateSettings("startWorkDays", [e.target.value]);
								}}
								label="Start Work Day"
							>
								{[
									"Monday",
									"Tuesday",
									"Wednesday",
									"Thursday",
									"Friday",
									"Saturday",
									"Sunday",
								].map((day) => (
									<MenuItem key={day} value={day}>
										{day}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl fullWidth margin="normal" size="small">
							<InputLabel>End Work Day</InputLabel>
							<Select
								value={localSettings.endWorkDays?.[0] || "Friday"}
								onChange={(e) => {
									updateSettings("endWorkDays", [e.target.value]);
								}}
								label="End Work Day"
							>
								{[
									"Monday",
									"Tuesday",
									"Wednesday",
									"Thursday",
									"Friday",
									"Saturday",
									"Sunday",
								].map((day) => (
									<MenuItem key={day} value={day}>
										{day}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<Box sx={{ mt: 2, mb: 1 }}>
							<Divider>
								<Chip label="Working Hours" />
							</Divider>
						</Box>

						<Box sx={{ display: "flex", gap: 2 }}>
							<TextField
								fullWidth
								size="small"
								label="Start Time"
								type="time"
								variant="outlined"
								margin="normal"
								value={localSettings.startTime || "09:00"}
								onChange={handleTextChange("startTime")}
								InputLabelProps={{ shrink: true }}
								inputProps={{ step: 300 }}
							/>

							<TextField
								fullWidth
								size="small"
								label="End Time"
								type="time"
								variant="outlined"
								margin="normal"
								value={localSettings.endTime || "17:00"}
								onChange={handleTextChange("endTime")}
								InputLabelProps={{ shrink: true }}
								inputProps={{ step: 300 }}
							/>
						</Box>

						<Box sx={{ mt: 2, mb: 2 }}>
							<Typography variant="subtitle2" gutterBottom>
								Duration (minutes)
							</Typography>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 2,
								}}
							>
								<IconButton
									color="primary"
									onClick={() => {
										const currentValue = parseInt(
											String(localSettings.duration || 30)
										);
										if (currentValue >= 10) {
											// Không cho phép giảm dưới 5 phút
											updateSettings("duration", currentValue - 5);
										}
									}}
								>
									<Remove />
								</IconButton>

								<Box
									sx={{
										width: "80px",
										textAlign: "center",
										padding: "8px 12px",
										border: "1px solid #e0e0e0",
										borderRadius: "4px",
										fontSize: "16px",
										fontWeight: "bold",
										backgroundColor: "#f5f5f5",
									}}
								>
									{localSettings.duration || 30}
								</Box>

								<IconButton
									color="primary"
									onClick={() => {
										const currentValue = parseInt(
											String(localSettings.duration || 0)
										);
										updateSettings("duration", currentValue + 5);
									}}
								>
									<Add />
								</IconButton>
							</Box>
							<Typography
								variant="caption"
								color="text.secondary"
								align="center"
								sx={{ display: "block", mt: 1 }}
							>
								Meeting Duration (minutes)
							</Typography>
						</Box>
					</>
				);

			case "webhook":
				return (
					<>
						<Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
							<Button
								variant="contained"
								color="primary"
								onClick={() => {
									toast.success("Webhook settings saved!");
								}}
								startIcon={<NotificationImportant />}
							>
								Save Webhook
							</Button>
						</Box>
					</>
				);

			case "condition":
				return (
					<>
						<TextField
							fullWidth
							size="small"
							label="Condition Field"
							variant="outlined"
							margin="normal"
							value={localSettings.field || ""}
							onChange={handleTextChange("field")}
							placeholder="Enter field name"
						/>
						<FormControl fullWidth margin="normal" size="small">
							<InputLabel>Operator</InputLabel>
							<Select
								value={localSettings.operator || "equals"}
								onChange={handleSelectChange("operator")}
								label="Operator"
							>
								<MenuItem value="equals">Equals</MenuItem>
								<MenuItem value="notEquals">Not Equals</MenuItem>
								<MenuItem value="contains">Contains</MenuItem>
								<MenuItem value="greaterThan">Greater Than</MenuItem>
								<MenuItem value="lessThan">Less Than</MenuItem>
							</Select>
						</FormControl>
						<TextField
							fullWidth
							size="small"
							label="Value"
							variant="outlined"
							margin="normal"
							value={localSettings.value || ""}
							onChange={handleTextChange("value")}
							placeholder="Enter value to compare"
						/>
					</>
				);

			case "email":
				return (
					<>
						<FormControl fullWidth margin="normal" size="small">
							<InputLabel>Email Provider</InputLabel>
							<Select
								value={localSettings.provider || "smtp"}
								onChange={handleSelectChange("provider")}
								label="Email Provider"
							>
								<MenuItem value="smtp">SMTP</MenuItem>
								<MenuItem value="sendgrid">SendGrid</MenuItem>
								<MenuItem value="mailchimp">Mailchimp</MenuItem>
							</Select>
						</FormControl>
						<TextField
							fullWidth
							size="small"
							label="Subject Template"
							variant="outlined"
							margin="normal"
							value={localSettings.subject || ""}
							onChange={handleTextChange("subject")}
							placeholder="Enter email subject"
						/>
						<TextField
							fullWidth
							size="small"
							label="Email Template"
							variant="outlined"
							margin="normal"
							multiline
							rows={3}
							value={localSettings.template || ""}
							onChange={handleTextChange("template")}
							placeholder="Enter email template"
						/>
					</>
				);

			case "sms":
				return (
					<>
						<FormControl fullWidth margin="normal" size="small">
							<InputLabel>SMS Provider</InputLabel>
							<Select
								value={localSettings.provider || "twilio"}
								onChange={handleSelectChange("provider")}
								label="SMS Provider"
							>
								<MenuItem value="twilio">Twilio</MenuItem>
								<MenuItem value="messagebird">MessageBird</MenuItem>
							</Select>
						</FormControl>
						<TextField
							fullWidth
							size="small"
							label="Message Template"
							variant="outlined"
							margin="normal"
							multiline
							rows={3}
							value={localSettings.template || ""}
							onChange={handleTextChange("template")}
							placeholder="Enter SMS template"
						/>
					</>
				);

			default:
				return (
					<Typography variant="body2" color="text.secondary">
						No specific settings available for this node type.
					</Typography>
				);
		}
	};

	return (
		<PanelContainer>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Typography variant="h6">Node Properties</Typography>
				<IconButton size="small" onClick={onClose}>
					<Close fontSize="small" />
				</IconButton>
			</Box>

			<NodeInfoCard>
				<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
					<NodeColorIndicator
						bgcolor={String(selectedNode.data?.color) || "#94a3b8"}
					/>
					<Typography variant="subtitle2">
						{String(selectedNode.type) || "Unknown Node"}
					</Typography>
				</Box>
				<Typography variant="caption" color="text.secondary">
					{String(selectedNode.data?.description) || "No description available"}
				</Typography>
			</NodeInfoCard>

			<Divider sx={{ my: 2 }} />

			<Typography variant="subtitle2" gutterBottom>
				Node Settings
			</Typography>

			{renderSettings()}

			<Divider sx={{ my: 2 }} />

			<Box sx={{ display: "flex", justifyContent: "space-between" }}>
				<Chip
					size="small"
					label={`ID: ${selectedNode.id.slice(0, 8)}`}
					variant="outlined"
				/>
				<Chip
					size="small"
					label={`Type: ${selectedNode.type}`}
					variant="outlined"
				/>
			</Box>
		</PanelContainer>
	);
};

export default PropertiesPanel;
