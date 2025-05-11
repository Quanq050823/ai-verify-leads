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
	Paper,
	InputAdornment,
	alpha,
	Slide,
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
	Check,
	Close,
	Sync,
	MoreVert,
	SaveAlt,
	DarkMode as DarkModeIcon,
	LightMode as LightModeIcon,
} from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { useTheme } from "@/context/ThemeContext";

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
	borderRadius: "8px",
	margin: "0 2px",
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.08),
	},
}));

const ToolbarContainer = styled(Paper)(({ theme }) => ({
	display: "flex",
	backdropFilter: "blur(12px)",
	borderRadius: "14px",
	boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
	border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
	overflow: "hidden",
	padding: theme.spacing(0.75),
}));

const FlowNameContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 2),
	marginRight: theme.spacing(1),
}));

const ActionButton = styled(Button)(({ theme }) => ({
	borderRadius: "10px",
	boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
	padding: theme.spacing(0.8, 2),
	transition: "all 0.2s",
	textTransform: "none",
	fontWeight: 600,
	"&:hover": {
		transform: "translateY(-2px)",
		boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
	},
	"&:active": {
		transform: "translateY(0px)",
	},
}));

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement<any, any>;
	},
	ref: React.Ref<unknown>
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

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
	const { isDarkMode, toggleTheme } = useTheme();
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [newName, setNewName] = useState(flowName);
	const [isEditing, setIsEditing] = useState(false);

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

	const handleInlineEdit = () => {
		setIsEditing(true);
		setNewName(flowName);
	};

	const handleInlineEditSave = () => {
		if (onRename && newName.trim()) {
			onRename(newName.trim());
		}
		setIsEditing(false);
	};

	const handleInlineEditCancel = () => {
		setIsEditing(false);
	};

	return (
		<>
			<ToolbarContainer elevation={2} className="lead-board">
				{onRename && (
					<>
						<FlowNameContainer>
							{isEditing ? (
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<TextField
										size="small"
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										autoFocus
										variant="outlined"
										sx={{
											width: "170px",
											"& .MuiOutlinedInput-root": {
												borderRadius: "8px",
											},
										}}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														edge="end"
														size="small"
														onClick={handleInlineEditSave}
														color="primary"
													>
														<Check fontSize="small" />
													</IconButton>
													<IconButton
														edge="end"
														size="small"
														onClick={handleInlineEditCancel}
														color="default"
													>
														<Close fontSize="small" />
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								</Box>
							) : (
								<>
									<Typography
										variant="subtitle1"
										noWrap
										sx={{
											maxWidth: 170,
											fontWeight: 600,
											cursor: "pointer",
											"&:hover": {
												color: "primary.main",
											},
										}}
										onClick={handleInlineEdit}
									>
										{flowName}
									</Typography>
									<Tooltip title="Edit Flow Name">
										<IconButton
											onClick={handleInlineEdit}
											size="small"
											sx={{ ml: 0.5 }}
											color="primary"
										>
											<Edit fontSize="small" />
										</IconButton>
									</Tooltip>
								</>
							)}
						</FlowNameContainer>
						<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
					</>
				)}

				<ButtonGroup variant="text" color="inherit">
					<Tooltip title="Save Flow">
						<ToolbarButton onClick={onSave}>
							<Save fontSize="small" />
						</ToolbarButton>
					</Tooltip>

					{/* <Tooltip title="Load Flow" arrow>
						<ToolbarButton onClick={onLoad}>
							<Upload fontSize="small" />
						</ToolbarButton>
					</Tooltip> */}

					<Tooltip title="Export Flow" arrow>
						<ToolbarButton onClick={onExport}>
							<SaveAlt fontSize="small" />
						</ToolbarButton>
					</Tooltip>
				</ButtonGroup>

				{/* <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} /> */}

				{/* <ButtonGroup variant="text" color="inherit">
					<Tooltip title="Zoom In" arrow>
						<ToolbarButton onClick={() => zoomIn({ duration: 300 })}>
							<ZoomIn fontSize="small" />
						</ToolbarButton>
					</Tooltip>

					<Tooltip title="Zoom Out" arrow>
						<ToolbarButton onClick={() => zoomOut({ duration: 300 })}>
							<ZoomOut fontSize="small" />
						</ToolbarButton>
					</Tooltip>

					<Tooltip title="Fit View" arrow>
						<ToolbarButton onClick={() => fitView({ duration: 500 })}>
							<CropFree fontSize="small" />
						</ToolbarButton>
					</Tooltip>
				</ButtonGroup> */}

				<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

				<ButtonGroup variant="text" color="inherit">
					<Tooltip title="Clear Flow" arrow>
						<ToolbarButton onClick={onClear} color="error">
							<Delete fontSize="small" />
						</ToolbarButton>
					</Tooltip>
				</ButtonGroup>

				<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

				<Tooltip title="Toggle Theme" arrow>
					<ToolbarButton onClick={toggleTheme}>
						{isDarkMode ? (
							<LightModeIcon fontSize="small" />
						) : (
							<DarkModeIcon fontSize="small" />
						)}
					</ToolbarButton>
				</Tooltip>

				<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

				<Tooltip title="Execute Flow" arrow>
					<ActionButton
						onClick={onRun}
						variant="contained"
						color="primary"
						startIcon={<PlayArrow />}
						sx={{
							ml: 0.5,
							backgroundImage: "linear-gradient(45deg, #3b82f6, #10b981)",
							transition: "all 0.2s ease",
						}}
					>
						Publish
					</ActionButton>
				</Tooltip>
			</ToolbarContainer>

			<Dialog
				open={renameDialogOpen}
				onClose={handleRenameClose}
				TransitionComponent={Transition}
				PaperProps={{
					elevation: 5,
					sx: {
						borderRadius: "12px",
						overflow: "hidden",
					},
				}}
			>
				<DialogTitle
					sx={{
						bgcolor: "primary.main",
						color: "white",
						py: 2,
					}}
				>
					Rename Flow
				</DialogTitle>
				<DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
					<TextField
						autoFocus
						margin="dense"
						label="Flow Name"
						type="text"
						fullWidth
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						variant="outlined"
						sx={{
							mt: 1,
							"& .MuiOutlinedInput-root": {
								borderRadius: "8px",
							},
						}}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button
						onClick={handleRenameClose}
						variant="outlined"
						sx={{ borderRadius: "8px", textTransform: "none" }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleRenameConfirm}
						color="primary"
						variant="contained"
						sx={{ borderRadius: "8px", textTransform: "none" }}
					>
						Rename
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default FlowToolbar;
