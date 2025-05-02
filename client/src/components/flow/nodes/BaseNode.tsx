import React, { memo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import {
	Box,
	Paper,
	Typography,
	Stack,
	IconButton,
	Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { lighten, alpha } from "@mui/material/styles";
import { Close as CloseIcon } from "@mui/icons-material";

type BaseNodeProps = {
	data: {
		label: string;
		icon?: React.ReactNode;
		description?: string;
		type: string;
		subType?: string;
		inputs?: number;
		outputs?: number;
		color?: string;
		webhookSubscribed?: boolean;
	};
	selected: boolean;
	id: string;
};

const NodeContainer = styled(Paper, {
	shouldForwardProp: (prop) => prop !== "selected" && prop !== "nodeColor",
})<{ selected?: boolean; nodeColor?: string }>(
	({ theme, selected, nodeColor }) => ({
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		width: "80px",
		height: "80px",
		borderRadius: "50%",
		backgroundColor: nodeColor || theme.palette.grey[300],
		position: "relative",
		cursor: "grab",
		willChange: "transform, box-shadow",
		boxShadow: selected
			? `0 0 0 2px ${theme.palette.primary.main}, 0px 3px 8px rgba(0,0,0,0.15)`
			: `0px 4px 10px rgba(0,0,0,0.1)`,

		"&:hover": {
			boxShadow: `0 0 0 3px ${alpha(
				nodeColor || theme.palette.grey[300],
				0.3
			)}, 0px 6px 14px rgba(0,0,0,0.15)`,
		},

		"& .MuiSvgIcon-root": {
			fontSize: "40px",
			color: "white",
		},
	})
);

const NodeLabel = styled(Box)(({ theme }) => ({
	position: "absolute",
	top: "100%",
	left: "50%",
	transform: "translateX(-50%)",
	textAlign: "center",
	marginTop: "8px",
	width: "120px",
	pointerEvents: "none",
}));

const ActionLabel = styled(Typography)(({ theme }) => ({
	fontSize: "11px",
	fontWeight: 500,
	color: theme.palette.text.secondary,
	marginTop: "4px",
	textTransform: "uppercase",
	letterSpacing: "0.5px",
}));

const StyledHandle = styled(Handle)(({ theme }) => ({
	width: "10px",
	height: "10px",
	backgroundColor: "#fff",
	border: "2px solid #778899",
	zIndex: 10,
	borderRadius: "50%",
	boxShadow: "0 1px 2px rgba(0,0,0,0.1)",

	"&:hover": {
		backgroundColor: theme.palette.primary.main,
		borderColor: theme.palette.primary.dark,
		transform: "scale(1.2)",
	},
}));

const HandleLabel = styled(Typography)(({ theme }) => ({
	position: "absolute",
	fontSize: "10px",
	fontWeight: "bold",
	color: theme.palette.text.secondary,
	pointerEvents: "none",
	right: "-4px",
	transform: "translateX(100%)",
	marginRight: "8px",
	whiteSpace: "nowrap",
	backgroundColor: alpha(theme.palette.background.paper, 0.85),
	padding: "2px 6px",
	borderRadius: "4px",
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
	position: "absolute",
	top: "-8px",
	right: "60px",
	width: "20px",
	height: "20px",
	backgroundColor: theme.palette.background.paper,
	color: theme.palette.grey[600],
	padding: 0,
	minWidth: 0,
	border: `1px solid ${theme.palette.grey[200]}`,
	boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
	opacity: 0,
	zIndex: 20,
	"&:hover": {
		backgroundColor: theme.palette.error.light,
		color: theme.palette.error.contrastText,
	},
}));

const NodeWrapper = styled(Box)(({ theme }) => ({
	position: "relative",
	"&:hover .delete-button": {
		opacity: 1,
	},
	"&:hover .node-tooltip": {
		opacity: 1,
	},
	"&:active": {
		cursor: "grabbing",
	},
}));

const NodeTooltip = styled(Box)(({ theme }) => ({
	position: "absolute",
	top: "-32px",
	left: "50%",
	transform: "translateX(-50%)",
	backgroundColor: alpha(theme.palette.background.paper, 0.9),
	color: theme.palette.text.primary,
	padding: "3px 6px",
	borderRadius: "4px",
	fontSize: "11px",
	boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
	zIndex: 30,
	opacity: 0,
	pointerEvents: "none",
	whiteSpace: "nowrap",
}));

const getActionName = (type: string): string => {
	switch (type.toLowerCase()) {
		case "facebookads":
			return "Get Hook Ads";
		case "facebookleadads":
			return "Get Lead Ads";
		case "googlesheets":
			return "Get Lead";
		case "aicall":
			return "Process AI";
		case "googleCalendar":
			return "Schedule Event";
		case "webhook":
			return "HTTP Request";
		case "condition":
			return "Branch Logic";
		case "preverify":
			return "Pre-Verify";
		case "email":
			return "Send Email";
		case "sms":
			return "Send Message";
		case "config":
			return "Configure";
		case "error":
			return "Handle Error";
		default:
			return "Action";
	}
};

const BaseNode = ({ data, selected, id }: BaseNodeProps) => {
	const nodeColor = data.color || "#94a3b8";
	const actionName = getActionName(id.split("_")[0]);
	const { setNodes } = useReactFlow();

	const inputCount = data.inputs !== undefined ? data.inputs : 1;
	const outputCount = data.outputs !== undefined ? data.outputs : 1;

	const getHandlePositions = (count: number) => {
		if (count === 1) return [0.5];
		const positions: number[] = [];
		for (let i = 0; i < count; i++) {
			positions.push((i / (count - 1)) * 0.8 + 0.1);
		}
		return positions;
	};

	const inputPositions = getHandlePositions(inputCount);
	const outputPositions = getHandlePositions(outputCount);

	const handleDeleteNode = (event: React.MouseEvent) => {
		event.stopPropagation();
		event.preventDefault();
		setNodes((nodes) => nodes.filter((node) => node.id !== id));
	};

	// Hiển thị mô tả khi có
	const showDescription = data.description && data.description.length > 0;

	return (
		<NodeWrapper>
			{showDescription && (
				<NodeTooltip className="node-tooltip">{data.description}</NodeTooltip>
			)}

			<DeleteButton
				className="delete-button"
				onClick={handleDeleteNode}
				size="small"
				aria-label="delete node"
			>
				<CloseIcon fontSize="small" />
			</DeleteButton>

			<NodeContainer selected={selected} nodeColor={nodeColor}>
				{data.icon}
			</NodeContainer>

			<NodeLabel>
				<Typography
					variant="body2"
					sx={{
						fontWeight: 600,
						color: "text.primary",
						fontSize: "12px",
					}}
				>
					{data.label}
				</Typography>
				<ActionLabel>{actionName}</ActionLabel>
			</NodeLabel>

			{inputPositions.map((pos, index) => (
				<StyledHandle
					key={`input-${index}`}
					type="target"
					position={Position.Left}
					id={`input-${index}`}
					style={{ left: -5, top: `${pos * 100}%` }}
				/>
			))}

			{outputPositions.map((pos, index) => (
				<StyledHandle
					key={`output-${index}`}
					type="source"
					position={Position.Right}
					id={`output-${index}`}
					style={{ right: -4, top: `${pos * 100}%` }}
				/>
			))}
		</NodeWrapper>
	);
};

export default memo(BaseNode);
