import React, { useEffect, useState } from "react";
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
	CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { fetchAllNodeTypes, NodeType } from "@/services/nodetypeServices";
import { getNodeIcon, getNodeColor } from "@/utils/nodeUtils";

type NodeCategory = {
	title: string;
	items: NodeItem[];
};

type NodeItem = {
	type: string;
	label: string;
	icon: React.ReactNode;
	color: string;
	description?: string;
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

// Phân loại node vào từng danh mục
const categorizeNodes = (nodes: NodeType[]): NodeCategory[] => {
	const dataSourcesCategory: NodeItem[] = [];
	const processingCategory: NodeItem[] = [];
	const actionsCategory: NodeItem[] = [];
	const utilitiesCategory: NodeItem[] = [];

	nodes.forEach((node) => {
		const nodeKey = node.key || "";
		const nodeItem: NodeItem = {
			type: nodeKey,
			label: node.name,
			icon: getNodeIcon(nodeKey),
			color: getNodeColor(nodeKey),
			description: node.description,
		};

		// Phân loại node dựa trên key hoặc đặc điểm
		if (
			nodeKey.includes("facebook") ||
			nodeKey.includes("google") ||
			nodeKey.includes("Sheets")
		) {
			dataSourcesCategory.push(nodeItem);
		} else if (
			nodeKey.includes("Call") ||
			nodeKey.includes("Verify") ||
			nodeKey.includes("webhook") ||
			nodeKey.includes("condition")
		) {
			processingCategory.push(nodeItem);
		} else if (
			nodeKey.includes("email") ||
			nodeKey.includes("sms") ||
			nodeKey.includes("notification")
		) {
			actionsCategory.push(nodeItem);
		} else {
			utilitiesCategory.push(nodeItem);
		}
	});

	return [
		{
			title: "Data Sources",
			items: dataSourcesCategory,
		},
		{
			title: "Processing",
			items: processingCategory,
		},
		{
			title: "Actions",
			items: actionsCategory,
		},
		{
			title: "Utilities",
			items: utilitiesCategory,
		},
	].filter((category) => category.items.length > 0); // Lọc các danh mục không có node
};

// Dữ liệu mẫu dự phòng khi API gặp lỗi
const fallbackNodeCategories: NodeCategory[] = [
	{
		title: "Data Sources",
		items: [
			{
				type: "googleSheets",
				label: "Google Sheets",
				icon: getNodeIcon("googleSheets"),
				color: getNodeColor("googleSheets"),
			},
			{
				type: "facebookAds",
				label: "Facebook Ads",
				icon: getNodeIcon("facebookAds"),
				color: getNodeColor("facebookAds"),
			},
		],
	},
	{
		title: "Processing",
		items: [
			{
				type: "aiCall",
				label: "AI Call",
				icon: getNodeIcon("aiCall"),
				color: getNodeColor("aiCall"),
			},
			{
				type: "googleCalendar",
				label: "Google Calendar",
				icon: getNodeIcon("googleCalendar"),
				color: getNodeColor("googleCalendar"),
			},
			{
				type: "webhook",
				label: "Webhook",
				icon: getNodeIcon("webhook"),
				color: getNodeColor("webhook"),
			},
			{
				type: "condition",
				label: "Condition",
				icon: getNodeIcon("condition"),
				color: getNodeColor("condition"),
			},
		],
	},
	{
		title: "Actions",
		items: [
			{
				type: "email",
				label: "Send Email",
				icon: getNodeIcon("email"),
				color: getNodeColor("email"),
			},
			{
				type: "sms",
				label: "Send SMS",
				icon: getNodeIcon("sms"),
				color: getNodeColor("sms"),
			},
		],
	},
	{
		title: "Utilities",
		items: [
			{
				type: "config",
				label: "Configuration",
				icon: getNodeIcon("config"),
				color: getNodeColor("config"),
			},
			{
				type: "error",
				label: "Error Handler",
				icon: getNodeIcon("error"),
				color: getNodeColor("error"),
			},
		],
	},
];

type SidebarProps = {
	onDragStart: (event: React.DragEvent, nodeType: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
	const [nodeCategories, setNodeCategories] = useState<NodeCategory[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);

	useEffect(() => {
		const loadNodeTypes = async () => {
			try {
				setLoading(true);
				const data = await fetchAllNodeTypes();

				if (data && !data.error && Array.isArray(data)) {
					const categories = categorizeNodes(data);
					setNodeCategories(categories);
				} else {
					console.error("Failed to fetch node types or invalid data format");
					setNodeCategories(fallbackNodeCategories);
					setError(true);
				}
			} catch (err) {
				console.error("Error loading node types:", err);
				setNodeCategories(fallbackNodeCategories);
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		loadNodeTypes();
	}, []);

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

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress size={24} />
				</Box>
			) : (
				<>
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
										title={item.description || item.label}
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
				</>
			)}

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
