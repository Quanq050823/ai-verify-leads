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
} from "@mui/material";
import { Close } from "@mui/icons-material";

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
	[key: string]: string | number | undefined;
}

const PanelContainer = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.background.paper,
	borderLeft: `1px solid ${theme.palette.divider}`,
	width: "280px",
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

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
	selectedNode,
	onChange,
	onClose,
}) => {
	const [localSettings, setLocalSettings] = useState<NodeSettings>({});

	if (!selectedNode) {
		return null;
	}

	// Initialize local settings if node changes
	useEffect(() => {
		if (selectedNode) {
			const nodeSettings = selectedNode.data?.settings || {};
			setLocalSettings(nodeSettings as NodeSettings);
		}
	}, [selectedNode]);

	const updateSettings = (key: string, value: string | number) => {
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
				return (
					<>
						<TextField
							fullWidth
							size="small"
							label="Ad Account ID"
							variant="outlined"
							margin="normal"
							value={localSettings.adAccountId || ""}
							onChange={handleTextChange("adAccountId")}
							placeholder="Enter ad account ID"
						/>
						<TextField
							fullWidth
							size="small"
							label="Campaign ID"
							variant="outlined"
							margin="normal"
							value={localSettings.campaignId || ""}
							onChange={handleTextChange("campaignId")}
							placeholder="Enter campaign ID"
						/>
					</>
				);

			case "aiCall":
				return (
					<>
						<FormControl fullWidth margin="normal" size="small">
							<InputLabel>API Provider</InputLabel>
							<Select
								value={localSettings.apiProvider || "openai"}
								onChange={handleSelectChange("apiProvider")}
								label="API Provider"
							>
								<MenuItem value="openai">OpenAI</MenuItem>
								<MenuItem value="twilio">Twilio</MenuItem>
							</Select>
						</FormControl>
						<TextField
							fullWidth
							size="small"
							label="API Key"
							variant="outlined"
							margin="normal"
							type="password"
							value={localSettings.apiKey || ""}
							onChange={handleTextChange("apiKey")}
							placeholder="Enter API key"
						/>
						<TextField
							fullWidth
							size="small"
							label="Prompt Template"
							variant="outlined"
							margin="normal"
							multiline
							rows={3}
							value={localSettings.promptTemplate || ""}
							onChange={handleTextChange("promptTemplate")}
							placeholder="Enter prompt template"
						/>
					</>
				);

			case "calendar":
				return (
					<>
						<TextField
							fullWidth
							size="small"
							label="Calendar ID"
							variant="outlined"
							margin="normal"
							value={localSettings.calendarId || ""}
							onChange={handleTextChange("calendarId")}
							placeholder="Enter calendar ID"
						/>
						<TextField
							fullWidth
							size="small"
							label="Event Duration (minutes)"
							variant="outlined"
							margin="normal"
							type="number"
							InputProps={{ inputProps: { min: 5, max: 240 } }}
							value={localSettings.duration || 30}
							onChange={handleNumberChange("duration")}
						/>
						<Select
							labelId="demo-simple-select-autowidth-label"
							id="demo-simple-select-autowidth"
							value={"20"}
							autoWidth
							label="Status"
						>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							<MenuItem value={20}>True</MenuItem>
							<MenuItem value={21}>False</MenuItem>
							<MenuItem value={22}>Undefined</MenuItem>
						</Select>
					</>
				);

			case "webhook":
				return (
					<>
						<TextField
							fullWidth
							size="small"
							label="Webhook URL"
							variant="outlined"
							margin="normal"
							value={localSettings.webhookUrl || ""}
							onChange={handleTextChange("webhookUrl")}
							placeholder="Enter webhook URL"
						/>
						<FormControl fullWidth margin="normal" size="small">
							<InputLabel>Method</InputLabel>
							<Select
								value={localSettings.method || "POST"}
								onChange={handleSelectChange("method")}
								label="Method"
							>
								<MenuItem value="GET">GET</MenuItem>
								<MenuItem value="POST">POST</MenuItem>
								<MenuItem value="PUT">PUT</MenuItem>
								<MenuItem value="DELETE">DELETE</MenuItem>
							</Select>
						</FormControl>
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
						{String(selectedNode.data?.label) || "Unknown Node"}
					</Typography>
				</Box>
				<Typography variant="caption" color="text.secondary">
					{String(selectedNode.data?.description) || "No description available"}
				</Typography>
			</NodeInfoCard>

			<TextField
				fullWidth
				size="small"
				label="Node Name"
				variant="outlined"
				margin="normal"
				value={String(selectedNode.data?.label) || ""}
				onChange={(e) =>
					onChange(selectedNode.id, {
						...selectedNode.data,
						label: e.target.value,
					})
				}
				placeholder="Enter node name"
			/>

			<TextField
				fullWidth
				size="small"
				label="Description"
				variant="outlined"
				margin="normal"
				multiline
				rows={2}
				value={String(selectedNode.data?.description) || ""}
				onChange={(e) =>
					onChange(selectedNode.id, {
						...selectedNode.data,
						description: e.target.value,
					})
				}
				placeholder="Enter description"
			/>

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
