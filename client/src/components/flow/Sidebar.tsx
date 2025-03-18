import React from "react";
import {
	Box,
	Typography,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider,
	Paper,
	styled,
	Button,
} from "@mui/material";
import {
	TableChart,
	Facebook,
	SmartToy,
	CalendarMonth,
	Webhook,
	CallSplit,
	Email,
	Phone,
	Settings,
	ErrorOutline,
	ArrowBack,
} from "@mui/icons-material";

type NodeCategory = {
	title: string;
	items: NodeItem[];
};

type NodeItem = {
	type: string;
	label: string;
	icon: React.ReactNode;
	color: string;
};

const SidebarContainer = styled(Paper)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	height: "100%",
	width: "240px",
	padding: theme.spacing(2),
	borderRight: `1px solid ${theme.palette.divider}`,
	zIndex: 10,
	backgroundColor: theme.palette.background.paper,
	boxShadow: theme.shadows[2],
}));

const NodeItem = styled(ListItem)(({ theme }) => ({
	padding: theme.spacing(1),
	marginBottom: theme.spacing(0.5),
	borderRadius: theme.shape.borderRadius,
	cursor: "grab",
	"&:hover": {
		backgroundColor: theme.palette.action.hover,
	},
}));

const NodeIconContainer = styled(Box, {
	shouldForwardProp: (prop) => prop !== "bgcolor",
})<{ bgcolor: string }>(({ theme, bgcolor }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: bgcolor,
	color: "white",
	borderRadius: theme.shape.borderRadius,
	padding: theme.spacing(0.5),
	width: "24px",
	height: "24px",
	"& .MuiSvgIcon-root": {
		fontSize: "14px",
	},
}));

const SidebarFooter = styled(Box)(({ theme }) => ({
	marginTop: "auto",
	paddingTop: theme.spacing(2),
	borderTop: `1px solid ${theme.palette.divider}`,
}));

const nodeCategories: NodeCategory[] = [
	{
		title: "Data Sources",
		items: [
			{
				type: "googleSheets",
				label: "Google Sheets",
				icon: <TableChart fontSize="small" />,
				color: "#34A853",
			},
			{
				type: "facebookAds",
				label: "Facebook Ads",
				icon: <Facebook fontSize="small" />,
				color: "#1877F2",
			},
		],
	},
	{
		title: "Processing",
		items: [
			{
				type: "aiCall",
				label: "AI Call",
				icon: <SmartToy fontSize="small" />,
				color: "#10B981",
			},
			{
				type: "calendar",
				label: "Google Calendar",
				icon: <CalendarMonth fontSize="small" />,
				color: "#4285F4",
			},
			{
				type: "webhook",
				label: "Webhook",
				icon: <Webhook fontSize="small" />,
				color: "#8B5CF6",
			},
			{
				type: "condition",
				label: "Condition",
				icon: <CallSplit fontSize="small" />,
				color: "#F59E0B",
			},
		],
	},
	{
		title: "Actions",
		items: [
			{
				type: "email",
				label: "Send Email",
				icon: <Email fontSize="small" />,
				color: "#EC4899",
			},
			{
				type: "sms",
				label: "Send SMS",
				icon: <Phone fontSize="small" />,
				color: "#6366F1",
			},
		],
	},
	{
		title: "Utilities",
		items: [
			{
				type: "config",
				label: "Configuration",
				icon: <Settings fontSize="small" />,
				color: "#6B7280",
			},
			{
				type: "error",
				label: "Error Handler",
				icon: <ErrorOutline fontSize="small" />,
				color: "#EF4444",
			},
		],
	},
];

type SidebarProps = {
	onDragStart: (event: React.DragEvent, nodeType: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
	return (
		<SidebarContainer elevation={2} sx={{ height: "100vh", overflowY: "auto" }}>
			<Button
				href="/pages/flow/"
				startIcon={<ArrowBack />}
				sx={{ mb: 2, ml: 0, justifyContent: "flex-start" }}
			>
				Back
			</Button>
			<Typography variant="h6" sx={{ mb: 2 }}>
				Flow Components
			</Typography>

			{nodeCategories.map((category) => (
				<Box key={category.title} sx={{ mb: 2 }}>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1, color: "text.secondary" }}
					>
						{category.title}
					</Typography>

					<List disablePadding>
						{category.items.map((item) => (
							<NodeItem
								key={item.type}
								onDragStart={(event) => onDragStart(event, item.type)}
								draggable
								disablePadding
							>
								<ListItemIcon sx={{ minWidth: 36 }}>
									<NodeIconContainer bgcolor={item.color}>
										{item.icon}
									</NodeIconContainer>
								</ListItemIcon>
								<ListItemText
									primary={item.label}
									primaryTypographyProps={{ variant: "body2" }}
								/>
							</NodeItem>
						))}
					</List>
				</Box>
			))}

			<SidebarFooter>
				<Typography variant="caption" color="text.secondary" paragraph>
					Drag components to the canvas
				</Typography>
				<Typography variant="caption" color="text.secondary">
					Connect nodes by dragging between handles
				</Typography>
			</SidebarFooter>
		</SidebarContainer>
	);
};

export default Sidebar;
