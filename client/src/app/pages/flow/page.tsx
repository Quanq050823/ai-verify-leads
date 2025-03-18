"use client";
import React, { useState } from "react";
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
import AddIcon from "@mui/icons-material/Add";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Link from "next/link";

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
	id: number;
	name: string;
	date: string;
	creator: string;
	active: boolean;
	components: Component[];
}

interface FlowListProps {
	flows: Flow[];
	activeFlowId: number | null;
	onToggleActive: (id: number) => void;
}

const FlowList: React.FC<FlowListProps> = ({
	flows,
	activeFlowId,
	onToggleActive,
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

	const handleConfirmAction = () => {
		if (dialogAction === "clone") {
			console.log(`Cloning flow: ${selectedFlow?.name}`);
		} else if (dialogAction === "delete") {
			console.log(`Deleting flow: ${selectedFlow?.name}`);
		}
		handleDialogClose();
		handleMenuClose();
	};

	const handleEditFlow = (flow: Flow) => {
		console.log(`Editing flow: ${flow.name}`);
		// Điều hướng đến trang chỉnh sửa luồng, ví dụ:
		// history.push(`/edit-flow/${flow.id}`);
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
						}}
						className="scenario flow-item"
						onClick={() => handleEditFlow(flow)}
					>
						<Grid container alignItems="center">
							<Grid item xs={2}>
								<Box style={{ display: "flex" }}>
									{flow.components.map((component, idx) => (
										<img
											key={idx}
											src={component.logo}
											alt={component.name}
											width={40}
											height={40}
											style={{
												borderRadius: "7px",
												marginInline: "2px",
												backgroundColor: component.backgroundColor,
												padding: "4px",
											}}
										/>
									))}
								</Box>
							</Grid>
							<Grid item xs={8}>
								<Link href="/pages/customflow">
									<Box>
										<Typography variant="h6">{flow.name}</Typography>
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
								</Link>
							</Grid>
							<Grid item xs={1}>
								<Tooltip title="Only one flow can be run" placement="left">
									<Switch
										checked={activeFlowId === flow.id}
										onChange={() => onToggleActive(flow.id)}
										color="primary"
									/>
								</Tooltip>
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
									<MenuItem onClick={() => handleDialogOpen("clone")}>
										Clone
									</MenuItem>
									<MenuItem onClick={() => handleDialogOpen("delete")}>
										Delete
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
						{`Are you sure you want to ${dialogAction} the flow "${selectedFlow?.name}"?`}
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

const ImportLeadUI: React.FC = () => {
	const [open, setOpen] = useState<boolean>(false);
	const [flows, setFlows] = useState<Flow[]>([
		{
			id: 1,
			name: "Integration Google Sheets",
			date: "2023-10-01",
			creator: "Duc Quang",
			active: true,
			components: [
				{
					name: "Facebook",
					logo: "/images/icons/facebook-lead-ads_64.png",
					backgroundColor: "#1877f2",
				},
				{
					name: "Google Sheets",
					logo: "/images/icons/google-sheets_64.png",
					backgroundColor: "#0fa763",
				},
			],
		},
		{
			id: 2,
			name: "Integration Facebook Lead Ads Google Sheets Google Calendar",
			date: "2023-10-01",
			creator: "Duc Quang",
			active: true,
			components: [
				{
					name: "Facebook",
					logo: "/images/icons/facebook-lead-ads_64.png",
					backgroundColor: "#1877f2",
				},
				{
					name: "Google Sheets",
					logo: "/images/icons/google-sheets_64.png",
					backgroundColor: "#0fa763",
				},
				{
					name: "Google Calendar",
					logo: "/images/icons/google-calendar_64.png",
					backgroundColor: "#007ee5",
				},
			],
		},
		{
			id: 3,
			name: "New scenario",
			date: "2023-10-01",
			creator: "Binh Phuoc",
			active: true,
			components: [
				{
					name: "Facebook",
					logo: "/images/icons/facebook-lead-ads_64.png",
					backgroundColor: "#1877f2",
				},
				{
					name: "Google Sheets",
					logo: "/images/icons/google-sheets_64.png",
					backgroundColor: "#0fa763",
				},
				{
					name: "Google Calendar",
					logo: "/images/icons/google-calendar_64.png",
					backgroundColor: "#007ee5",
				},
				{
					name: "Webhook",
					logo: "/images/icons/gateway_64.png",
					backgroundColor: "#c73a63",
				},
			],
		},
	]);

	const [activeFlowId, setActiveFlowId] = useState<number | null>(null);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleToggleActive = (id: number) => {
		setActiveFlowId((prevActiveFlowId) =>
			prevActiveFlowId === id ? null : id
		);
		console.log(`Toggled active state for flow with id: ${id}`);
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
				<h1>All scenarios</h1>
				<Button variant="outlined" onClick={handleClickOpen}>
					<AddIcon
						sx={{
							position: "relative",
							paddingRight: "5px",
						}}
					/>{" "}
					<Link href="/pages/customflow">
						<Typography color="primary">Create a new Scenario</Typography>
					</Link>
				</Button>
			</Box>
			<FlowList
				flows={flows}
				activeFlowId={activeFlowId}
				onToggleActive={handleToggleActive}
			/>
		</Box>
	);
};
export default ImportLeadUI;
