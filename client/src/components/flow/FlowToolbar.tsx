import React from "react";
import { useReactFlow } from "@xyflow/react";
import { Box, Button, ButtonGroup, Divider, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
	Save,
	Upload,
	Download,
	PlayArrow,
	Delete,
	ZoomIn,
	ZoomOut,
	CropFree,
} from "@mui/icons-material";

type FlowToolbarProps = {
	onSave: () => void;
	onLoad: () => void;
	onExport: () => void;
	onClear: () => void;
	onRun: () => void;
};

const ToolbarButton = styled(Button)(({ theme }) => ({
	minWidth: "40px",
	padding: theme.spacing(1),
}));

const ToolbarContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	backgroundColor: theme.palette.background.paper,
	borderRadius: theme.shape.borderRadius,
	boxShadow: theme.shadows[1],
	border: `1px solid ${theme.palette.divider}`,
	overflow: "hidden",
}));

const FlowToolbar: React.FC<FlowToolbarProps> = ({
	onSave,
	onLoad,
	onExport,
	onClear,
	onRun,
}) => {
	const { zoomIn, zoomOut, fitView } = useReactFlow();

	return (
		<ToolbarContainer>
			<ButtonGroup variant="text" color="inherit">
				<Tooltip title="Save Flow">
					<ToolbarButton onClick={onSave}>
						<Save fontSize="small" />
					</ToolbarButton>
				</Tooltip>

				<Tooltip title="Load Flow">
					<ToolbarButton onClick={onLoad}>
						<Upload fontSize="small" />
					</ToolbarButton>
				</Tooltip>

				<Tooltip title="Export Flow">
					<ToolbarButton onClick={onExport}>
						<Download fontSize="small" />
					</ToolbarButton>
				</Tooltip>
			</ButtonGroup>

			<Divider orientation="vertical" flexItem />

			<ButtonGroup variant="text" color="inherit">
				<Tooltip title="Zoom In">
					<ToolbarButton onClick={() => zoomIn()}>
						<ZoomIn fontSize="small" />
					</ToolbarButton>
				</Tooltip>

				<Tooltip title="Zoom Out">
					<ToolbarButton onClick={() => zoomOut()}>
						<ZoomOut fontSize="small" />
					</ToolbarButton>
				</Tooltip>

				<Tooltip title="Fit View">
					<ToolbarButton onClick={() => fitView()}>
						<CropFree fontSize="small" />
					</ToolbarButton>
				</Tooltip>
			</ButtonGroup>

			<Divider orientation="vertical" flexItem />

			<ButtonGroup variant="text" color="inherit">
				<Tooltip title="Clear Flow">
					<ToolbarButton onClick={onClear}>
						<Delete fontSize="small" />
					</ToolbarButton>
				</Tooltip>
			</ButtonGroup>

			<Divider orientation="vertical" flexItem />

			<Tooltip title="Run Flow">
				<ToolbarButton
					onClick={onRun}
					color="primary"
					variant="contained"
					sx={{ borderRadius: 0 }}
				>
					<PlayArrow fontSize="small" />
				</ToolbarButton>
			</Tooltip>
		</ToolbarContainer>
	);
};

export default FlowToolbar;
