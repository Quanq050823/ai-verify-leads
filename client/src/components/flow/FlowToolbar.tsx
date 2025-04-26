import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import {
	Box,
	Button,
	ButtonGroup,
	Divider,
	Tooltip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
	IconButton,
} from "@mui/material";
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
	Edit,
} from "@mui/icons-material";

type FlowToolbarProps = {
	onSave: () => void;
	onLoad: () => void;
	onExport: () => void;
	onClear: () => void;
	onRun: () => void;
	flowName?: string;
	onRename?: (newName: string) => void;
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

const FlowNameContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 2),
	marginRight: theme.spacing(1),
}));

const FlowToolbar: React.FC<FlowToolbarProps> = ({
	onSave,
	onLoad,
	onExport,
	onClear,
	onRun,
	flowName = "Untitled Flow",
	onRename,
}) => {
	const { zoomIn, zoomOut, fitView } = useReactFlow();
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [newName, setNewName] = useState(flowName);

	const handleRenameClick = () => {
		setNewName(flowName);
		setRenameDialogOpen(true);
	};

	const handleRenameClose = () => {
		setRenameDialogOpen(false);
	};

	const handleRenameConfirm = () => {
		if (onRename && newName.trim()) {
			onRename(newName.trim());
		}
		setRenameDialogOpen(false);
	};

	return (
		<>
			<ToolbarContainer>
				{onRename && (
					<>
						<FlowNameContainer>
							<Typography variant="subtitle1" noWrap sx={{ maxWidth: 200 }}>
								{flowName}
							</Typography>
							<Tooltip title="Rename Flow">
								<IconButton
									onClick={handleRenameClick}
									size="small"
									sx={{ ml: 1 }}
								>
									<Edit fontSize="small" />
								</IconButton>
							</Tooltip>
						</FlowNameContainer>
						<Divider orientation="vertical" flexItem />
					</>
				)}

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

			<Dialog open={renameDialogOpen} onClose={handleRenameClose}>
				<DialogTitle>Rename Flow</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="Flow Name"
						type="text"
						fullWidth
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleRenameClose}>Cancel</Button>
					<Button onClick={handleRenameConfirm} color="primary">
						Rename
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default FlowToolbar;
