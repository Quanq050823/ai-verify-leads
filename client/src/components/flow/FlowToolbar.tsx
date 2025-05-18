import React, { useState, useEffect } from "react";
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
	Switch,
	FormControlLabel,
	Badge,
	Chip,
	Zoom,
	Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
	Save,
	Delete,
	Edit,
	Check,
	Close,
	SaveAlt,
	DarkMode as DarkModeIcon,
	LightMode as LightModeIcon,
	PowerSettingsNew as PowerIcon,
	FileUpload,
	ExpandLess,
	ExpandMore,
} from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { useTheme } from "@/context/ThemeContext";

const TOOLBAR_STORAGE_KEY = "flowToolbarVisible";

type FlowToolbarProps = {
	onSave: () => void;
	onLoad: () => void;
	onExport: () => void;
	onClear: () => void;
	onToggleStatus: () => void;
	flowName?: string;
	flowStatus?: number;
	onRename?: (newName: string) => void;
};

const ToolbarButton = styled(IconButton)(({ theme }) => ({
	width: "40px",
	height: "40px",
	borderRadius: "12px",
	margin: "0 4px",
	color:
		theme.palette.mode === "dark"
			? theme.palette.grey[300]
			: theme.palette.grey[700],
	transition: "all 0.2s ease-in-out",
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.1),
		transform: "translateY(-2px)",
		color: theme.palette.primary.main,
	},
	"&:active": {
		transform: "translateY(0px)",
	},
}));

const ToolbarContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	backgroundColor:
		theme.palette.mode === "dark"
			? alpha(theme.palette.background.paper, 0.95)
			: alpha(theme.palette.background.paper, 0.95),
	borderBottomLeftRadius: "16px",
	borderBottomRightRadius: "16px",
	boxShadow:
		theme.palette.mode === "dark"
			? "0 8px 24px rgba(0,0,0,0.2)"
			: "0 8px 24px rgba(0,0,0,0.06)",
	border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
	overflow: "hidden",
	padding: theme.spacing(1.5),
	margin: theme.spacing(1.5),
	transition: "all 0.3s ease",
	"&:hover": {
		boxShadow:
			theme.palette.mode === "dark"
				? "0 12px 28px rgba(0,0,0,0.25)"
				: "0 12px 28px rgba(0,0,0,0.1)",
	},
}));

const ToolbarSection = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: theme.spacing(0.5),
}));

const StatusChip = styled(Chip)(({ theme }) => ({
	height: 28,
	fontWeight: 600,
	borderRadius: 8,
	transition: "all 0.2s ease",
	"& .MuiChip-label": {
		padding: "0 12px",
	},
}));

const ActiveChip = styled(StatusChip)(({ theme }) => ({
	backgroundColor: alpha("#10b981", 0.15),
	color: "#10b981",
	border: "1px solid",
	borderColor: alpha("#10b981", 0.3),
}));

const DisabledChip = styled(StatusChip)(({ theme }) => ({
	backgroundColor: alpha(theme.palette.text.secondary, 0.1),
	color: theme.palette.text.secondary,
	border: "1px solid",
	borderColor: alpha(theme.palette.text.secondary, 0.2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
	height: "60%",
	margin: theme.spacing(0, 1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
	"& .MuiOutlinedInput-root": {
		borderRadius: "12px",
		fontSize: "0.95rem",
		backgroundColor: alpha(theme.palette.background.paper, 0.6),
		transition: "all 0.2s ease",
		"&:hover": {
			backgroundColor: alpha(theme.palette.background.paper, 0.8),
		},
		"&.Mui-focused": {
			boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
		},
	},
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
	position: "absolute",
	top: 0,
	left: 563,
	backgroundColor:
		theme.palette.mode === "dark"
			? alpha(theme.palette.background.paper, 0.95)
			: alpha(theme.palette.background.paper, 0.95),
	border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
	borderRadius: "0 0 12px 12px",
	padding: theme.spacing(0.5),
	boxShadow:
		theme.palette.mode === "dark"
			? "0 4px 12px rgba(0,0,0,0.2)"
			: "0 4px 12px rgba(0,0,0,0.06)",
	zIndex: 100,
	transform: "translateY(-1px)",
	transition: "all 0.2s ease",
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.1),
		transform: "translateY(0px)",
	},
}));

const ToolbarWrapper = styled(Box)({
	position: "relative",
	width: "100%",
});

const FlowNameTypography = styled(Typography)(({ theme }) => ({
	fontWeight: 600,
	cursor: "pointer",
	transition: "all 0.2s ease",
	padding: "6px 10px",
	borderRadius: "8px",
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.1),
		color: theme.palette.primary.main,
	},
}));

const FlowToolbar: React.FC<FlowToolbarProps> = ({
	onSave,
	onLoad,
	onExport,
	onClear,
	onToggleStatus,
	flowName = "Untitled Flow",
	flowStatus = 1, // Default to disabled
	onRename,
}) => {
	const { isDarkMode, toggleTheme } = useTheme();
	const [newName, setNewName] = useState(flowName);
	const [isEditing, setIsEditing] = useState(false);
	const reactFlow = useReactFlow();
	const [isToolbarVisible, setIsToolbarVisible] = useState(() => {
		const saved = localStorage.getItem(TOOLBAR_STORAGE_KEY);
		return saved !== null ? saved === "true" : true;
	});

	useEffect(() => {
		localStorage.setItem(TOOLBAR_STORAGE_KEY, isToolbarVisible.toString());
	}, [isToolbarVisible]);

	const toggleToolbarVisibility = () => {
		setIsToolbarVisible((prev) => !prev);
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

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleInlineEditSave();
		} else if (e.key === "Escape") {
			handleInlineEditCancel();
		}
	};

	const isFlowActive = flowStatus === 2;

	return (
		<ToolbarWrapper>
			<Fade in={isToolbarVisible}>
				<ToolbarContainer>
					<ToolbarSection>
						{onRename && (
							<>
								<Box sx={{ display: "flex", alignItems: "center" }}>
									{isEditing ? (
										<StyledTextField
											size="small"
											value={newName}
											onChange={(e) => setNewName(e.target.value)}
											onKeyDown={handleKeyDown}
											autoFocus
											variant="outlined"
											placeholder="Flow name"
											sx={{ width: "190px" }}
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														<IconButton
															edge="end"
															size="small"
															onClick={handleInlineEditSave}
															sx={{
																color: "primary.main",
																"&:hover": {
																	backgroundColor: alpha("#10b981", 0.1),
																},
															}}
														>
															<Check fontSize="small" />
														</IconButton>
														<IconButton
															edge="end"
															size="small"
															onClick={handleInlineEditCancel}
															sx={{
																color: "text.secondary",
																"&:hover": {
																	backgroundColor: alpha("#ef4444", 0.1),
																	color: "#ef4444",
																},
															}}
														>
															<Close fontSize="small" />
														</IconButton>
													</InputAdornment>
												),
											}}
										/>
									) : (
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<FlowNameTypography
												variant="subtitle1"
												noWrap
												sx={{ maxWidth: 190 }}
												onClick={handleInlineEdit}
											>
												{flowName}
											</FlowNameTypography>
											<Tooltip title="Edit Flow Name" arrow>
												<IconButton
													onClick={handleInlineEdit}
													size="small"
													color="primary"
													sx={{
														ml: 0.5,
														opacity: 0.8,
														"&:hover": { opacity: 1 },
													}}
												>
													<Edit fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
								</Box>
								<StyledDivider orientation="vertical" flexItem />
							</>
						)}

						<Tooltip title="Save Flow" arrow placement="bottom">
							<ToolbarButton onClick={onSave} color="primary">
								<Save fontSize="small" />
							</ToolbarButton>
						</Tooltip>

						<Tooltip title="Import Flow" arrow placement="bottom">
							<ToolbarButton onClick={onLoad}>
								<FileUpload fontSize="small" />
							</ToolbarButton>
						</Tooltip>

						<Tooltip title="Export Flow" arrow placement="bottom">
							<ToolbarButton onClick={onExport}>
								<SaveAlt fontSize="small" />
							</ToolbarButton>
						</Tooltip>

						<StyledDivider orientation="vertical" flexItem />
					</ToolbarSection>

					<ToolbarSection>
						<Tooltip title="Toggle Theme" arrow placement="bottom">
							<ToolbarButton onClick={toggleTheme}>
								{isDarkMode ? (
									<LightModeIcon fontSize="small" />
								) : (
									<DarkModeIcon fontSize="small" />
								)}
							</ToolbarButton>
						</Tooltip>

						<Tooltip title="Clear Flow" arrow placement="bottom">
							<ToolbarButton
								onClick={onClear}
								sx={{
									"&:hover": {
										backgroundColor: alpha("#ef4444", 0.1),
										color: "#ef4444",
									},
								}}
							>
								<Delete fontSize="small" />
							</ToolbarButton>
						</Tooltip>

						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Tooltip
								title={isFlowActive ? "Disable Flow" : "Enable Flow"}
								arrow
								placement="bottom"
							>
								<IconButton
									size="small"
									onClick={onToggleStatus}
									sx={{
										p: 0.5,
										transition: "all 0.2s ease",
										transform: isFlowActive ? "rotate(0deg)" : "rotate(-30deg)",
										color: isFlowActive
											? "#10b981"
											: (theme) => theme.palette.text.secondary,
									}}
								>
									<PowerIcon fontSize="small" />
								</IconButton>
							</Tooltip>
							{isFlowActive ? (
								<ActiveChip label="Active" size="small" />
							) : (
								<DisabledChip label="Disabled" size="small" />
							)}
						</Box>
					</ToolbarSection>
				</ToolbarContainer>
			</Fade>

			<Zoom in={true}>
				<ToggleButton
					onClick={toggleToolbarVisibility}
					size="small"
					color="primary"
					aria-label={isToolbarVisible ? "Hide toolbar" : "Show toolbar"}
				>
					{isToolbarVisible ? (
						<ExpandLess fontSize="small" />
					) : (
						<ExpandMore fontSize="small" />
					)}
				</ToggleButton>
			</Zoom>
		</ToolbarWrapper>
	);
};

export default FlowToolbar;
