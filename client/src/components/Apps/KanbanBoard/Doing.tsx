"use client";

import React, { useState, FormEvent } from "react";
import {
	Card,
	Box,
	Typography,
	Menu,
	MenuItem,
	IconButton,
	AvatarGroup,
	Avatar,
	Button,
	DialogTitle,
	Grid,
	FormControl,
	InputLabel,
	TextField,
	Dialog,
	OutlinedInput,
	Checkbox,
	ListItemText,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// ToDo data
interface TeamMember {
	img: string;
}

interface ToDoList {
	leadName: string;
	leadEmail: string;
	leadPhone: string;
	leadSource: string;
	leadweb: string;
	attempts: string;
	bgClass: string;
}

const toDoListData: ToDoList[] = [
	{
		leadName: "John Doe",
		leadEmail: "john.doe@example.com",
		leadPhone: "+84 123 456 789",
		leadSource: "Facebook",
		leadweb: "dattax.vn",
		attempts: "Attempts: 2",
		bgClass: "bg-purple-100",
	},
	{
		leadName: "Alice Nguyen",
		leadEmail: "alice.nguyen@example.com",
		leadPhone: "+84 987 654 321",
		leadSource: "Facebook",
		leadweb: "caxsoft.vn",
		attempts: "Attempts: 4",
		bgClass: "bg-danger-100",
	},
	{
		leadName: "David Tran",
		leadEmail: "david.tran@example.com",
		leadPhone: "+84 555 666 777",
		leadSource: "Facebook",
		leadweb: "davidtran.com",
		attempts: "Attempts: 5",
		bgClass: "bg-success-100",
	},
];

// Modal
interface BootstrapDialogTitleProps {
	children?: React.ReactNode;
	onClose: () => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
	"& .MuiDialogContent-root": {
		padding: theme.spacing(2),
	},
	"& .MuiDialogActions-root": {
		padding: theme.spacing(1),
	},
}));

function BootstrapDialogTitle(props: BootstrapDialogTitleProps) {
	const { children, onClose, ...other } = props;

	return (
		<DialogTitle sx={{ m: 0, p: 2 }} {...other}>
			{children}
			{onClose ? (
				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
						color: (theme) => theme.palette.grey[500],
					}}
				>
					<CloseIcon />
				</IconButton>
			) : null}
		</DialogTitle>
	);
}

BootstrapDialogTitle.propTypes = {
	children: PropTypes.node,
	onClose: PropTypes.func.isRequired,
};
// End Modal

// Select input data
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

const names = [
	"Sarah Johnson",
	"Michael Smith",
	"Emily Brown",
	"Jason Lee",
	"Ashley Davis",
	"Mark Thompson",
];

const ToDo: React.FC = () => {
	// Dropdown
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	// Modal
	const [openModal, setOpenModal] = useState(false);
	const handleClickOpenModal = () => {
		setOpenModal(true);
	};
	const handleCloseModal = () => {
		setOpenModal(false);
	};
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// const data = new FormData(event.currentTarget);
		// console.log();
	};

	// Select team members
	const [teamMembersName, setTeamMembersName] = useState<string[]>([]);

	const handleChange = (
		event: SelectChangeEvent<typeof teamMembersName>,
		setNames: React.Dispatch<React.SetStateAction<string[]>>
	) => {
		const {
			target: { value },
		} = event;
		setNames(
			// On autofill we get a stringified value.
			typeof value === "string" ? value.split(",") : value
		);
	};

	return (
		<>
			<Card
				sx={{
					boxShadow: "none",
					borderRadius: "7px",
					mb: "25px",
					padding: { xs: "18px", sm: "20px", lg: "25px" },
					maxWidth: "350px",
				}}
				className="rmui-card"
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						mb: "15px",
					}}
				>
					<Typography
						variant="h3"
						sx={{
							fontSize: { xs: "16px", md: "18px" },
							fontWeight: 700,
						}}
						className="text-black"
					>
						Verifying
					</Typography>

					<Box>
						<IconButton
							onClick={handleClick}
							size="small"
							aria-controls={open ? "account-menu" : undefined}
							aria-haspopup="true"
							aria-expanded={open ? "true" : undefined}
						>
							<MoreHorizIcon sx={{ fontSize: "25px" }} />
						</IconButton>

						<Menu
							anchorEl={anchorEl}
							id="account-menu"
							open={open}
							onClose={handleClose}
							onClick={handleClose}
							PaperProps={{
								elevation: 0,

								sx: {
									overflow: "visible",
									boxShadow: "0 4px 45px #0000001a",
									mt: 0,
									"& .MuiAvatar-root": {
										width: 32,
										height: 32,
										ml: -0.5,
										mr: 1,
									},
								},
							}}
							transformOrigin={{ horizontal: "right", vertical: "top" }}
							anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
						>
							<MenuItem>Delete Column</MenuItem>
						</Menu>
					</Box>
				</Box>

				<Box>
					{toDoListData &&
						toDoListData.map((toDoList, index) => (
							<Box
								className={`bg-purple-100 ${toDoList.bgClass} task-card`}
								style={{
									borderWidth: "2px",
									borderStyle: "solid",
								}}
								sx={{
									padding: "25px",
									borderRadius: "7px",
									marginBottom: "25px",
								}}
								key={index}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										mb: "17px",
									}}
								>
									<Typography
										variant="h4"
										fontWeight={600}
										fontSize="15px"
										className="text-black"
									>
										{toDoList.leadName}
									</Typography>

									<IconButton aria-label="delete" size="small">
										<EditIcon fontSize="inherit" />
									</IconButton>
								</Box>

								<Typography mb="5px">Email: {toDoList.leadEmail}</Typography>
								<Typography mb="5px"> Phone: {toDoList.leadPhone}</Typography>
								<Typography mb="5px">Source: {toDoList.leadSource}</Typography>
								<Typography mb="5px">
									Website:{" "}
									<a
										href={`https://${toDoList.leadweb}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										{toDoList.leadweb}
									</a>
								</Typography>

								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										mt: "5px",
									}}
								>
									<AvatarGroup
										max={3}
										sx={{
											"& .MuiAvatar-root": {
												border: "2px solid #fff",
												backgroundColor: "#f0f0f0",
												color: "#000",
												width: "28px",
												height: "28px",
											},
											"& .MuiAvatarGroup-avatar": {
												backgroundColor: "#605dff", // Custom background color for the total avatar
												color: "#fff", // Custom color for the text
												fontSize: "10px",
											},
										}}
									></AvatarGroup>

									<Typography color="primary.main">
										{toDoList.attempts}
									</Typography>
								</Box>
							</Box>
						))}

					<Box>
						<Button
							variant="outlined"
							color="primary"
							sx={{
								borderRadius: "7px",
								padding: "3.3px 11px",
								fontSize: "14px",
								fontWeight: "500",
								textTransform: "capitalize",
								boxShadow: "none",
								textAlign: "center",
							}}
							onClick={handleClickOpenModal}
						>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "5px",
								}}
							>
								<i
									className="material-symbols-outlined"
									style={{ fontSize: "20px" }}
								>
									add
								</i>
								Add New Card
							</Box>
						</Button>
					</Box>
				</Box>
			</Card>

			{/* Modal */}
			<BootstrapDialog
				onClose={handleCloseModal}
				aria-labelledby="customized-dialog-title"
				open={openModal}
				className="rmu-modal"
			>
				<Box>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							background: "#f6f7f9",
							padding: { xs: "15px 20px", md: "25px" },
						}}
						className="rmu-modal-header"
					>
						<Typography
							id="modal-modal-title"
							variant="h6"
							sx={{
								fontWeight: "600",
								fontSize: { xs: "16px", md: "18px" },
							}}
							className="text-black"
						>
							Add New Card
						</Typography>

						<IconButton
							aria-label="remove"
							size="small"
							onClick={handleCloseModal}
						>
							<ClearIcon />
						</IconButton>
					</Box>

					<Box className="rmu-modal-content">
						<Box component="form" noValidate onSubmit={handleSubmit}>
							<Box
								sx={{
									padding: "25px",
									borderRadius: "8px",
								}}
								className="bg-white"
							>
								<Grid container alignItems="center" spacing={2}>
									<Grid item xs={12} md={12} lg={12}>
										<Typography
											component="h5"
											sx={{
												fontWeight: "500",
												fontSize: "14px",
												mb: "12px",
											}}
											className="text-black"
										>
											Name
										</Typography>

										<TextField
											autoComplete="name"
											name="name"
											required
											fullWidth
											id="name"
											label="Name"
											autoFocus
											InputProps={{
												style: { borderRadius: 8 },
											}}
										/>
									</Grid>

									<Grid item xs={12} md={12} lg={12}>
										<Typography
											component="h5"
											sx={{
												fontWeight: "500",
												fontSize: "14px",
												mb: "12px",
											}}
											className="text-black"
										>
											Email
										</Typography>

										<TextField
											autoComplete="email"
											name="email"
											required
											fullWidth
											id="email"
											label="Email"
											InputProps={{
												style: { borderRadius: 8 },
											}}
										/>
									</Grid>

									<Grid item xs={12} md={12} lg={12}>
										<Typography
											component="h5"
											sx={{
												fontWeight: "500",
												fontSize: "14px",
												mb: "12px",
											}}
											className="text-black"
										>
											Phone
										</Typography>

										<TextField
											autoComplete="phone"
											name="phone"
											required
											fullWidth
											id="phone"
											label="Phone"
											InputProps={{
												style: { borderRadius: 8 },
											}}
										/>
									</Grid>

									<Grid item xs={12} md={12} lg={12}>
										<Typography
											component="h5"
											sx={{
												fontWeight: "500",
												fontSize: "14px",
												mb: "12px",
											}}
											className="text-black"
										>
											Source
										</Typography>

										<FormControl fullWidth>
											<InputLabel id="source-select-label">Source</InputLabel>
											<Select
												labelId="source-select-label"
												id="source-select"
												name="source"
												required
												input={<OutlinedInput label="Source" />}
											>
												<MenuItem value="Facebook">Facebook</MenuItem>
												<MenuItem value="Import GG Sheet">
													Import GG Sheet
												</MenuItem>
											</Select>
										</FormControl>
									</Grid>

									<Grid item xs={12} mt={1}>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "end",
												gap: "10px",
											}}
										>
											<Button
												onClick={handleCloseModal}
												variant="outlined"
												color="error"
												sx={{
													textTransform: "capitalize",
													borderRadius: "8px",
													fontWeight: "500",
													fontSize: "13px",
													padding: "11px 30px",
												}}
											>
												Cancel
											</Button>

											<Button
												type="submit"
												variant="contained"
												sx={{
													textTransform: "capitalize",
													borderRadius: "8px",
													fontWeight: "500",
													fontSize: "13px",
													padding: "11px 30px",
													color: "#fff !important",
												}}
											>
												<AddIcon
													sx={{
														position: "relative",
														top: "-1px",
													}}
												/>{" "}
												Create
											</Button>
										</Box>
									</Grid>
								</Grid>
							</Box>
						</Box>
					</Box>
				</Box>
			</BootstrapDialog>
		</>
	);
};

export default ToDo;
