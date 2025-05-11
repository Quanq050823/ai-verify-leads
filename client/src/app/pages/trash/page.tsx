"use client";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { Tooltip } from "@mui/material";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TableChart from "@mui/icons-material/TableChart";
import Facebook from "@mui/icons-material/Facebook";
import SmartToy from "@mui/icons-material/SmartToy";
import Webhook from "@mui/icons-material/Webhook";
import CallSplit from "@mui/icons-material/CallSplit";
import Email from "@mui/icons-material/Email";
import Phone from "@mui/icons-material/Phone";
import Settings from "@mui/icons-material/Settings";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Layers from "@mui/icons-material/Layers";
import Link from "next/link";
import { getNodeIcon, getNodeColor } from "@/utils/nodeUtils";
import {
	fetchAllFlow,
	enableFlow,
	disableFlow,
	deleteFlow,
	restoreFlow,
	permanentDeleteFlow,
} from "@/services/flowServices";

const UploadBox = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	textAlign: "center",
	color: theme.palette.text.secondary,
	border: "2px dashed #ccc",
	cursor: "pointer",
	height: "100%",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	backgroundColor: theme.palette.background.default,
	transition: "background-color 0.3s",
	"&:hover": {
		backgroundColor: theme.palette.action.hover,
	},
}));

interface Component {
	name: string;
	logo: string;
	backgroundColor: string;
}

interface Flow {
	id: string;
	name: string;
	date: string;
	creator: string;
	status: number;
	components: Component[];
}

interface FlowListProps {
	flows: Flow[];
	activeFlowId: string | null;
	onToggleActive: (id: string) => void;
	onDeleteFlow: (id: string) => void;
	onRestoreFlow: (id: string) => void;
	loadFlows: () => Promise<void>;
}

const FlowList: React.FC<FlowListProps> = ({
	flows,
	activeFlowId,
	onToggleActive,
	onDeleteFlow,
	onRestoreFlow,
	loadFlows,
}) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [dialogAction, setDialogAction] = useState<string>("");

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, flow: Flow) => {
		setAnchorEl(event.currentTarget);
		setSelectedFlow(flow);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedFlow(null);
	};

	const handleDialogOpen = (action: string) => {
		setDialogAction(action);
		setDialogOpen(true);
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
	};

	const handleConfirmAction = async () => {
		if (!selectedFlow) return;

		try {
			if (dialogAction === "delete") {
				const response = await permanentDeleteFlow(selectedFlow.id);
				if (!response?.error) {
					await loadFlows();
				}
			} else if (dialogAction === "restore") {
				const response = await restoreFlow(selectedFlow.id);
				if (!response?.error) {
					await loadFlows();
				}
			}
		} catch (error) {
			console.error(`Error during ${dialogAction} action:`, error);
		}

		handleDialogClose();
		handleMenuClose();
	};

	const handleEditFlow = (flow: Flow) => {
		console.log(`Editing flow: ${flow.name}`);
		// Chuyển hướng đến trang chỉnh sửa luồng với ID flow
		window.location.href = `/pages/customflow?id=${flow.id}`;
	};

	return (
		<Grid container spacing={2}>
			{flows.map((flow) => (
				<Grid item xs={12} key={flow.id}>
					<Paper
						style={{
							padding: "16px",
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
							transition: "background-color 0.3s",
							boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
							borderRadius: "8px",
							backgroundColor: "#f9f9f9",
						}}
						className="scenario flow-item flow-card-content"
					>
						<Grid container alignItems="center">
							<Grid item xs={2}>
								<Box style={{ display: "flex", alignItems: "center" }}>
									{flow.components && flow.components.length > 0 ? (
										<>
											{flow.components.slice(0, 3).map((component, idx) => (
												<Box
													key={idx}
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														backgroundColor:
															component.backgroundColor ||
															getNodeColor(component.name),
														color: "white",
														borderRadius: "7px",
														width: "40px",
														height: "40px",
														marginRight: "5px",
													}}
												>
													{getNodeIcon(component.name)}
												</Box>
											))}
											{flow.components.length > 3 && (
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														backgroundColor: "#9E9E9E",
														color: "white",
														borderRadius: "7px",
														width: "40px",
														height: "40px",
														fontSize: "14px",
														fontWeight: "bold",
													}}
												>
													+{flow.components.length - 3}
												</Box>
											)}
										</>
									) : (
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												backgroundColor: "#9E9E9E",
												color: "white",
												borderRadius: "7px",
												width: "40px",
												height: "40px",
											}}
										>
											<Layers fontSize="small" />
										</Box>
									)}
								</Box>
							</Grid>
							<Grid item xs={8}>
								<Box onClick={() => handleEditFlow(flow)}>
									<Typography variant="h6" style={{ fontWeight: "bold" }}>
										{flow.name}
									</Typography>
									<Typography
										variant="body2"
										color="textSecondary"
										style={{ display: "flex", alignItems: "center" }}
									>
										<CalendarMonthIcon style={{ marginRight: "5px" }} />
										{flow.date}
										<PersonIcon
											style={{ marginRight: "5px", marginLeft: "10px" }}
										/>
										{flow.creator}
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={1}>
								<IconButton
									aria-controls="simple-menu"
									aria-haspopup="true"
									onClick={(event) => handleMenuOpen(event, flow)}
								>
									<MoreVertIcon />
								</IconButton>
								<Menu
									id="simple-menu"
									anchorEl={anchorEl}
									keepMounted
									open={Boolean(anchorEl)}
									onClose={handleMenuClose}
									PaperProps={{
										elevation: 0,
										sx: {
											borderRadius: "7px",
											boxShadow: "0 4px 45px rgba(99, 99, 99, 0.1)",
											overflow: "visible",
											mt: 1.5,
											"& .MuiAvatar-root": {
												width: 32,
												height: 32,
												ml: -0.5,
												mr: 1,
											},
											"&:before": {
												content: '""',
												display: "block",
												position: "absolute",
												top: 0,
												right: 14,
												width: 10,
												height: 10,
												bgcolor: "background.paper",
												transform: "translateY(-50%) rotate(45deg)",
												zIndex: 0,
											},
										},
									}}
									transformOrigin={{ horizontal: "right", vertical: "top" }}
									anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
									className="for-dark-top-navList"
								>
									<MenuItem onClick={() => handleDialogOpen("delete")}>
										Permanently Delete
									</MenuItem>
									<MenuItem onClick={() => handleDialogOpen("restore")}>
										Restore
									</MenuItem>
								</Menu>
							</Grid>
						</Grid>
					</Paper>
				</Grid>
			))}
			<Dialog
				open={dialogOpen}
				onClose={handleDialogClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{`Confirm ${dialogAction}`}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{dialogAction === "delete"
							? `Are you sure you want to permanently delete the flow "${selectedFlow?.name}"? This action cannot be undone.`
							: `Are you sure you want to restore the flow "${selectedFlow?.name}"?`}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDialogClose} color="primary">
						Cancel
					</Button>
					<Button onClick={handleConfirmAction} color="primary" autoFocus>
						Confirm
					</Button>
				</DialogActions>
			</Dialog>
		</Grid>
	);
};

const TrashPage: React.FC = () => {
	const [flows, setFlows] = useState<Flow[]>([]);
	const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const loadFlows = async () => {
		try {
			setIsLoading(true);
			const data = await fetchAllFlow();
			if (data) {
				const formattedFlows = data
					.filter((flow: any) => flow.status === 0) // Chỉ lấy các luồng có trạng thái '0'
					.map((flow: any) => {
						// Trích xuất các loại node từ nodeData để tạo thành phần
						const nodeTypes =
							flow.nodeData?.nodes?.map((node: any) => ({
								name: node.type,
								backgroundColor: getNodeColor(node.type),
							})) || [];

						// Loại bỏ trùng lặp nếu có
						const uniqueTypes = Array.from(
							new Set(nodeTypes.map((t: any) => t.name))
						).map((name) => nodeTypes.find((t: any) => t.name === name));

						return {
							id: flow._id || flow.id,
							name: flow.name,
							date: new Date(flow.createdAt).toLocaleDateString(),
							creator: flow.userId || "Unknown",
							status: flow.status,
							components:
								uniqueTypes.length > 0 ? uniqueTypes : flow.components || [],
						};
					});
				setFlows(formattedFlows);
			}
		} catch (error) {
			console.error("Error loading flows:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadFlows();
	}, []);

	const handleToggleActive = async (flowId: string) => {
		try {
			const targetFlow = flows.find((flow) => flow.id === flowId);
			if (!targetFlow) return;

			let response;
			if (targetFlow.status === 1) {
				response = await enableFlow(flowId);
			} else if (targetFlow.status === 2) {
				response = await disableFlow(flowId);
			}

			if (!response?.error) {
				await loadFlows();
			}
		} catch (error) {
			console.error("Error toggling flow status:", error);
		}
	};

	const handleDeleteFlow = async (flowId: string) => {
		try {
			const response = await deleteFlow(flowId);
			if (!response?.error) {
				await loadFlows();
			}
		} catch (error) {
			console.error("Error deleting flow:", error);
		}
	};

	return (
		<Box
			style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}
		>
			<Box
				className="breadcrumb-card"
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h1>Trash</h1>
				<Button
					variant="outlined"
					component={Link}
					href="/pages/flow"
					style={{
						borderRadius: "8px",
						boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
					}}
				>
					<KeyboardReturnIcon
						sx={{
							position: "relative",
							paddingRight: "5px",
						}}
					/>
					<Typography color="primary">Back to Scenario</Typography>
				</Button>
			</Box>
			{isLoading ? (
				<Box display="flex" justifyContent="center" my={4}>
					<Typography>Loading flows...</Typography>
				</Box>
			) : (
				<FlowList
					flows={flows}
					activeFlowId={activeFlowId}
					onToggleActive={handleToggleActive}
					onDeleteFlow={handleDeleteFlow}
					onRestoreFlow={() => {}}
					loadFlows={loadFlows}
				/>
			)}
		</Box>
	);
};
export default TrashPage;
