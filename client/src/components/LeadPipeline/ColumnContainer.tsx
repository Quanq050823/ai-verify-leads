"use client";
import { Column, Id, Lead } from "../../type";

import React, {
	useState,
	FormEvent,
	useMemo,
	MouseEvent,
	useEffect,
	useRef,
	useCallback,
} from "react";
import {
	Card,
	Box,
	Typography,
	Menu,
	MenuItem,
	IconButton,
	Button,
	DialogTitle,
	Grid,
	FormControl,
	InputLabel,
	TextField,
	Dialog,
	OutlinedInput,
	Badge,
	Tooltip,
	Divider,
	Paper,
	DialogContent,
	DialogActions,
	Select,
	SelectChangeEvent,
	CircularProgress,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LeadCard from "./LeadCard";
import { toast } from "react-toastify";
import { retryLead } from "../../services/leadServices";

interface Props {
	column: Column;
	deleteColumn: (id: Id) => void;
}

function ColumnContainer(props: Props) {
	const { column, deleteColumn } = props;
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const [openCreateLead, setOpenCreateLead] = useState(false);
	const handleClickOpenCreateLead = () => {
		setOpenCreateLead(true);
	};
	const handleCloseCreateLead = () => {
		setOpenCreateLead(false);
	};
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// Implement lead creation logic here
		handleCloseCreateLead();
	};

	const [editLead, setEditLead] = useState<Lead | null>(null);
	const handleEditLead = (lead: Lead) => {
		setEditLead(lead);
	};
	const handleCloseEditLead = () => {
		setEditLead(null);
	};

	const [leads, setLeads] = useState<Lead[]>(column.leads || []);
	const [filterText, setFilterText] = useState("");
	const [visibleLeads, setVisibleLeads] = useState<number>(4);
	const [loading, setLoading] = useState(false);
	const columnContentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (
			column.leads &&
			JSON.stringify(column.leads) !== JSON.stringify(leads)
		) {
			setLeads(column.leads);
			setVisibleLeads(5); // Reset visible leads count when leads array changes
		}
	}, [column.leads]);

	const handleDeleteLead = async (leadId: string) => {};

	const handleRetryLead = async (leadId: string) => {
		try {
			setLoading(true);
			const result = await retryLead(leadId);
		} catch (error) {
			console.error("Error retrying lead:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleScroll = useCallback(() => {
		if (!columnContentRef.current) return;

		const { scrollTop, scrollHeight, clientHeight } = columnContentRef.current;
		const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 20;

		const filteredLeads = leads.filter((lead) => {
			if (filterText) {
				const searchText = filterText.toLowerCase();
				const name = lead.leadData.full_name || lead.leadData.name || "";
				const email = lead.leadData.email || "";
				const phone = lead.leadData.phone || "";
				const company =
					lead.leadData.company_name || lead.leadData.company || "";

				return (
					name.toLowerCase().includes(searchText) ||
					email.toLowerCase().includes(searchText) ||
					phone.toLowerCase().includes(searchText) ||
					company.toLowerCase().includes(searchText)
				);
			}
			return true;
		});

		if (scrolledToBottom && visibleLeads < filteredLeads.length && !loading) {
			setLoading(true);
			// Simulate loading delay
			setTimeout(() => {
				setVisibleLeads((prev) => prev + 4);
				setLoading(false);
			}, 300);
		}
	}, [leads, visibleLeads, filterText, loading]);

	useEffect(() => {
		const columnContent = columnContentRef.current;
		if (columnContent) {
			columnContent.addEventListener("scroll", handleScroll);
			return () => columnContent.removeEventListener("scroll", handleScroll);
		}
	}, [handleScroll]);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: column.id,
		data: {
			type: "Column",
			column,
		},
		disabled: open || openCreateLead,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	const handleColumnHeaderClick = (e: React.MouseEvent) => {
		if (
			e.target instanceof HTMLElement &&
			(e.target.closest("button") ||
				e.target.closest(".MuiMenu-root") ||
				e.target.closest("input") ||
				e.target.closest("select"))
		) {
			e.stopPropagation();
		}
	};

	// Filter leads based on search text
	const filteredLeads = leads.filter((lead) => {
		if (filterText) {
			const searchText = filterText.toLowerCase();
			const name = lead.leadData.full_name || lead.leadData.name || "";
			const email = lead.leadData.email || "";
			const phone = lead.leadData.phone || "";
			const company = lead.leadData.company_name || lead.leadData.company || "";

			return (
				name.toLowerCase().includes(searchText) ||
				email.toLowerCase().includes(searchText) ||
				phone.toLowerCase().includes(searchText) ||
				company.toLowerCase().includes(searchText)
			);
		}
		return true;
	});

	// Get only the visible leads
	const displayedLeads = filteredLeads.slice(0, visibleLeads);

	if (isDragging) {
		return (
			<div ref={setNodeRef} style={style} className="columnoverlay">
				<Box
					style={{
						minWidth: "320px",
						minHeight: "700px",
					}}
				>
					<Paper
						{...attributes}
						{...listeners}
						sx={{
							boxShadow: "none",
							borderRadius: "16px",
							mb: "25px",
							padding: { xs: "18px", sm: "20px", lg: "25px" },
							width: "320px",
							minHeight: "700px",
							opacity: "0.6",
							border: "2px dashed #0dcaf0",
						}}
						className="dragging-column"
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								mb: "15px",
							}}
						></Box>
					</Paper>
				</Box>
			</div>
		);
	}

	return (
		<div ref={setNodeRef} style={style}>
			<Box
				style={{
					minWidth: "320px",
					minHeight: "700px",
				}}
			>
				<Paper
					elevation={0}
					sx={{
						mb: "25px",
						width: "320px",
						overflow: "hidden",
						borderRadius: 2,
						backgroundColor: "background.paper",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					}}
					className="lighter-bg"
				>
					{/* Column Header */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							p: "16px 20px",
							cursor: "grab",
						}}
						className="flow-card-header"
						{...attributes}
						{...listeners}
						onClick={handleColumnHeaderClick}
					>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Typography
								variant="subtitle1"
								sx={{
									fontWeight: 600,
									fontSize: "15px",
								}}
							>
								{column.title}
							</Typography>

							<Badge
								badgeContent={column.leads?.length || 0}
								color="primary"
								sx={{
									ml: 2.5,
									"& .MuiBadge-badge": {
										fontSize: "11px",
										height: "18px",
										minWidth: "18px",
									},
								}}
							/>
						</Box>

						<Box sx={{ display: "flex" }}>
							<IconButton
								onClick={handleClick}
								size="small"
								aria-controls={open ? "column-menu" : undefined}
								aria-haspopup="true"
								aria-expanded={open ? "true" : undefined}
							>
								<MoreHorizIcon fontSize="small" sx={{ color: "#637381" }} />
							</IconButton>

							<Menu
								anchorEl={anchorEl}
								id="column-menu"
								open={open}
								onClose={handleClose}
								onClick={handleClose}
								PaperProps={{
									elevation: 2,
									sx: {
										overflow: "visible",
										mt: 1.5,
										boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
										borderRadius: "8px",
										minWidth: "150px",
									},
								}}
								transformOrigin={{ horizontal: "right", vertical: "top" }}
								anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
							>
								<MenuItem
									sx={{
										fontSize: "14px",
										py: 1,
										color: "#212B36",
									}}
								>
									Edit Column
								</MenuItem>
								<MenuItem
									onClick={() => deleteColumn(column.id)}
									sx={{
										fontSize: "14px",
										py: 1,
										color: "#F44336",
									}}
								>
									Delete Column
								</MenuItem>
							</Menu>
						</Box>
					</Box>

					{/* Card content area with scrolling */}
					<Box
						ref={columnContentRef}
						sx={{
							p: "16px",
							maxHeight: "80vh",
							overflowY: "auto",
							"&::-webkit-scrollbar": {
								width: "6px",
							},
							"&::-webkit-scrollbar-thumb": {
								background: "#DFE3E8",
								borderRadius: "10px",
							},
						}}
						className="flow-column-content"
					>
						{filteredLeads.length > 0 ? (
							<>
								{displayedLeads.map((lead) => (
									<LeadCard
										key={lead._id.toString()}
										lead={lead}
										onDelete={handleDeleteLead}
										onRetry={handleRetryLead}
									/>
								))}

								{loading && (
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											my: 2,
										}}
									>
										<CircularProgress size={24} color="primary" />
									</Box>
								)}

								{!loading && visibleLeads < filteredLeads.length && (
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											my: 2,
										}}
									>
										<Button
											size="small"
											onClick={() => setVisibleLeads((prev) => prev + 5)}
											sx={{
												textTransform: "none",
												fontSize: "0.8rem",
											}}
										>
											Load More
										</Button>
									</Box>
								)}
							</>
						) : (
							<Box
								sx={{
									p: 3,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									color: "text.secondary",
									backgroundColor: "#ffffff50",
									borderRadius: "8px",
									border: "1px dashed #DFE3E8",
								}}
							>
								<Typography
									sx={{
										mb: 1,
										fontSize: "14px",
										color: "#637381",
									}}
								>
									{filterText
										? "No leads match your filter"
										: "No leads in this column"}
								</Typography>
								{!filterText && (
									<Typography
										variant="caption"
										sx={{
											fontSize: "12px",
											color: "#919EAB",
										}}
									>
										Add a new lead to get started
									</Typography>
								)}
							</Box>
						)}
					</Box>
				</Paper>
			</Box>

			{/* Create Lead Modal */}
			<Dialog
				open={openCreateLead}
				onClose={handleCloseCreateLead}
				aria-labelledby="create-lead-dialog-title"
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: "16px",
						boxShadow: "0px 24px 48px rgba(0, 0, 0, 0.2)",
					},
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: "16px 24px",
					}}
				>
					<DialogTitle
						id="create-lead-dialog-title"
						sx={{
							p: 0,
							fontWeight: "600",
							fontSize: "18px",
						}}
					>
						Create New Lead
					</DialogTitle>
					<IconButton
						aria-label="close"
						onClick={handleCloseCreateLead}
						sx={{
							color: "text.secondary",
							p: 1,
						}}
					>
						<ClearIcon />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 3 }}>
					<Box component="form" noValidate onSubmit={handleSubmit}>
						<Grid container spacing={2}>
							<Grid item xs={12} md={6}>
								<Typography
									component="label"
									htmlFor="name"
									sx={{
										display: "block",
										fontWeight: "500",
										fontSize: "14px",
										mb: 1,
										color: "#212B36",
									}}
								>
									Name <span style={{ color: "#F44336" }}>*</span>
								</Typography>

								<TextField
									autoComplete="name"
									name="name"
									required
									fullWidth
									id="name"
									placeholder="Enter lead name"
									autoFocus
									size="small"
									InputProps={{
										style: { borderRadius: 8 },
									}}
								/>
							</Grid>

							<Grid item xs={12} md={6}>
								<Typography
									component="label"
									htmlFor="email"
									sx={{
										display: "block",
										fontWeight: "500",
										fontSize: "14px",
										mb: 1,
										color: "#212B36",
									}}
								>
									Email <span style={{ color: "#F44336" }}>*</span>
								</Typography>

								<TextField
									autoComplete="email"
									name="email"
									required
									fullWidth
									id="email"
									placeholder="Enter email address"
									size="small"
									InputProps={{
										style: { borderRadius: 8 },
									}}
								/>
							</Grid>

							<Grid item xs={12} md={6}>
								<Typography
									component="label"
									htmlFor="phone"
									sx={{
										display: "block",
										fontWeight: "500",
										fontSize: "14px",
										mb: 1,
										color: "#212B36",
									}}
								>
									Phone <span style={{ color: "#F44336" }}>*</span>
								</Typography>

								<TextField
									autoComplete="phone"
									name="phone"
									required
									fullWidth
									id="phone"
									placeholder="Enter phone number"
									size="small"
									InputProps={{
										style: { borderRadius: 8 },
									}}
								/>
							</Grid>

							<Grid item xs={12} md={6}>
								<Typography
									component="label"
									htmlFor="source"
									sx={{
										display: "block",
										fontWeight: "500",
										fontSize: "14px",
										mb: 1,
										color: "#212B36",
									}}
								>
									Source <span style={{ color: "#F44336" }}>*</span>
								</Typography>

								<FormControl fullWidth size="small">
									<Select
										id="source-select"
										name="source"
										displayEmpty
										required
										input={<OutlinedInput sx={{ borderRadius: 2 }} />}
										renderValue={(selected: string) => {
											if (!selected) {
												return (
													<span style={{ color: "#919EAB" }}>
														Select source
													</span>
												);
											}
											return selected;
										}}
									>
										<MenuItem value="Facebook">Facebook</MenuItem>
										<MenuItem value="Google">Google</MenuItem>
										<MenuItem value="Referral">Referral</MenuItem>
										<MenuItem value="Website">Website</MenuItem>
										<MenuItem value="LinkedIn">LinkedIn</MenuItem>
										<MenuItem value="Other">Other</MenuItem>
									</Select>
								</FormControl>
							</Grid>

							<Grid item xs={12} md={6}>
								<Typography
									component="label"
									htmlFor="company"
									sx={{
										display: "block",
										fontWeight: "500",
										fontSize: "14px",
										mb: 1,
										color: "#212B36",
									}}
								>
									Company
								</Typography>

								<TextField
									name="company"
									fullWidth
									id="company"
									placeholder="Enter company name"
									size="small"
									InputProps={{
										style: { borderRadius: 8 },
									}}
								/>
							</Grid>

							<Grid item xs={12} md={6}>
								<Typography
									component="label"
									htmlFor="position"
									sx={{
										display: "block",
										fontWeight: "500",
										fontSize: "14px",
										mb: 1,
										color: "#212B36",
									}}
								>
									Position
								</Typography>

								<TextField
									name="position"
									fullWidth
									id="position"
									placeholder="Enter position"
									size="small"
									InputProps={{
										style: { borderRadius: 8 },
									}}
								/>
							</Grid>

							<Grid item xs={12}>
								<Typography
									component="label"
									htmlFor="website"
									sx={{
										display: "block",
										fontWeight: "500",
										fontSize: "14px",
										mb: 1,
										color: "#212B36",
									}}
								>
									Website
								</Typography>

								<TextField
									name="website"
									fullWidth
									id="website"
									placeholder="example.com"
									size="small"
									InputProps={{
										style: { borderRadius: 8 },
									}}
								/>
							</Grid>

							<Grid item xs={12} sx={{ mt: 2 }}>
								<Button
									type="submit"
									variant="contained"
									fullWidth
									sx={{
										textTransform: "none",
										borderRadius: "8px",
										fontWeight: "600",
										fontSize: "15px",
										padding: "10px",
										boxShadow: "0px 8px 16px rgba(81, 100, 255, 0.24)",
									}}
								>
									Create Lead
								</Button>
							</Grid>
						</Grid>
					</Box>
				</Box>
			</Dialog>

			{/* Edit Lead Modal */}
			<Dialog
				open={Boolean(editLead)}
				onClose={handleCloseEditLead}
				aria-labelledby="edit-lead-dialog-title"
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: "16px",
						boxShadow: "0px 24px 48px rgba(0, 0, 0, 0.2)",
					},
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: "16px 24px",
					}}
				>
					<DialogTitle
						id="edit-lead-dialog-title"
						sx={{
							p: 0,
							fontWeight: "600",
							fontSize: "18px",
						}}
					>
						Edit Lead
					</DialogTitle>
					<IconButton
						aria-label="close"
						onClick={handleCloseEditLead}
						sx={{
							color: "text.secondary",
							p: 1,
						}}
					>
						<ClearIcon />
					</IconButton>
				</Box>

				<Divider />

				{editLead && (
					<Box sx={{ p: 3 }}>
						<Box component="form" noValidate onSubmit={handleSubmit}>
							<Grid container spacing={2}>
								<Grid item xs={12} md={6}>
									<Typography
										component="label"
										htmlFor="edit-name"
										sx={{
											display: "block",
											fontWeight: "500",
											fontSize: "14px",
											mb: 1,
											color: "#212B36",
										}}
									>
										Name <span style={{ color: "#F44336" }}>*</span>
									</Typography>

									<TextField
										autoComplete="name"
										name="name"
										required
										fullWidth
										id="edit-name"
										defaultValue={editLead.leadData?.full_name || ""}
										size="small"
										InputProps={{
											style: { borderRadius: 8 },
										}}
									/>
								</Grid>

								<Grid item xs={12} md={6}>
									<Typography
										component="label"
										htmlFor="edit-email"
										sx={{
											display: "block",
											fontWeight: "500",
											fontSize: "14px",
											mb: 1,
											color: "#212B36",
										}}
									>
										Email <span style={{ color: "#F44336" }}>*</span>
									</Typography>

									<TextField
										autoComplete="email"
										name="email"
										required
										fullWidth
										id="edit-email"
										defaultValue={editLead.leadData?.email || ""}
										size="small"
										InputProps={{
											style: { borderRadius: 8 },
										}}
									/>
								</Grid>

								<Grid item xs={12} md={6}>
									<Typography
										component="label"
										htmlFor="edit-phone"
										sx={{
											display: "block",
											fontWeight: "500",
											fontSize: "14px",
											mb: 1,
											color: "#212B36",
										}}
									>
										Phone <span style={{ color: "#F44336" }}>*</span>
									</Typography>

									<TextField
										autoComplete="phone"
										name="phone"
										required
										fullWidth
										id="edit-phone"
										defaultValue={editLead.leadData?.phone || ""}
										size="small"
										InputProps={{
											style: { borderRadius: 8 },
										}}
									/>
								</Grid>

								<Grid item xs={12} md={6}>
									<Typography
										component="label"
										htmlFor="edit-source"
										sx={{
											display: "block",
											fontWeight: "500",
											fontSize: "14px",
											mb: 1,
											color: "#212B36",
										}}
									>
										Source <span style={{ color: "#F44336" }}>*</span>
									</Typography>

									<FormControl fullWidth size="small">
										<Select
											id="edit-source-select"
											name="source"
											defaultValue={editLead.leadData?.source || "Facebook Ads"}
											required
											input={<OutlinedInput sx={{ borderRadius: 2 }} />}
										>
											<MenuItem value="Facebook">Facebook</MenuItem>
											<MenuItem value="Google">GG Sheet</MenuItem>
										</Select>
									</FormControl>
								</Grid>

								<Grid item xs={12} md={6}>
									<Typography
										component="label"
										htmlFor="edit-company"
										sx={{
											display: "block",
											fontWeight: "500",
											fontSize: "14px",
											mb: 1,
											color: "#212B36",
										}}
									>
										Company
									</Typography>

									<TextField
										name="company"
										fullWidth
										id="edit-company"
										defaultValue={editLead.leadData?.company_name || ""}
										size="small"
										InputProps={{
											style: { borderRadius: 8 },
										}}
									/>
								</Grid>

								<Grid item xs={12} md={6}>
									<Typography
										component="label"
										htmlFor="edit-position"
										sx={{
											display: "block",
											fontWeight: "500",
											fontSize: "14px",
											mb: 1,
											color: "#212B36",
										}}
									>
										Job Title
									</Typography>

									<TextField
										name="position"
										fullWidth
										id="edit-position"
										defaultValue={editLead.leadData?.job_title || ""}
										size="small"
										InputProps={{
											style: { borderRadius: 8 },
										}}
									/>
								</Grid>

								<Grid item xs={12}>
									<Typography
										component="label"
										htmlFor="edit-website"
										sx={{
											display: "block",
											fontWeight: "500",
											fontSize: "14px",
											mb: 1,
											color: "#212B36",
										}}
									>
										Website
									</Typography>

									<TextField
										name="website"
										fullWidth
										id="edit-website"
										defaultValue={editLead.leadData?.website_link || ""}
										size="small"
										InputProps={{
											style: { borderRadius: 8 },
										}}
									/>
								</Grid>

								<Grid item xs={12} sx={{ mt: 2 }}>
									<Button
										type="submit"
										variant="contained"
										fullWidth
										sx={{
											textTransform: "none",
											borderRadius: "8px",
											fontWeight: "600",
											fontSize: "15px",
											padding: "10px",
											boxShadow: "0px 8px 16px rgba(81, 100, 255, 0.24)",
										}}
									>
										Update Lead
									</Button>
								</Grid>
							</Grid>
						</Box>
					</Box>
				)}
			</Dialog>
		</div>
	);
}

export default ColumnContainer;
