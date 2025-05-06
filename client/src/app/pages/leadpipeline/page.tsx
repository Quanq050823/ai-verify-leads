"use client";

import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import ImportLeadContent from "./Importlead";
import {
	Box,
	CircularProgress,
	Typography,
	Paper,
	Breadcrumbs,
	Link,
	Divider,
} from "@mui/material";
import { Column, Id, Lead } from "../../../type";
import ColumnContainer from "../../../components/LeadPipeline/ColumnContainer";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { getLeads } from "../../../services/leadServices";

export default function Page() {
	const [open, setOpen] = useState(false);
	const [columns, setColumns] = useState<Column[]>([]);
	const [leads, setLeads] = useState<Lead[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
	const [activeColumn, setActiveColumn] = useState<Column | null>(null);

	// Configure sensor for drag operations
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 3, // 3px
			},
		})
	);

	// Fetch leads data on component mount
	useEffect(() => {
		const loadLeads = async () => {
			setLoading(true);
			try {
				const data = await getLeads();
				if (data) {
					setLeads(data);

					// Create default columns if no columns exist
					if (columns.length === 0) {
						const initialColumns: Column[] = [
							{ id: 1, title: "Pending Leads" },
							{ id: 2, title: "In Progress" },
							{ id: 3, title: "Success" },
							{ id: 4, title: "Done Process" },
						];
						setColumns(initialColumns);
					}
				}
			} catch (err) {
				console.error("Error loading leads:", err);
				setError("Failed to load leads. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		loadLeads();
	}, []);

	// Distribute leads to columns based on status
	useEffect(() => {
		if (leads.length > 0 && columns.length > 0) {
			const updatedColumns = columns.map((column, index) => {
				let columnLeads: Lead[] = [];

				// Distribute leads based on status
				// Status: 1 - pending, 2 - in-progress, 3 - success, 9 - done-process
				if (index === 0) {
					// Pending Leads - status 1
					columnLeads = leads.filter((lead) => lead.status === 1);
				} else if (index === 1) {
					// In Progress - status 2
					columnLeads = leads.filter((lead) => lead.status === 2);
				} else if (index === 2) {
					// Success - status 3
					columnLeads = leads.filter((lead) => lead.status === 3);
				} else if (index === 3) {
					// Done Process - status 9
					columnLeads = leads.filter((lead) => lead.status === 9);
				}

				return {
					...column,
					leads: columnLeads,
				};
			});

			setColumns(updatedColumns);
		}
	}, [leads]);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	function createNewColumn() {
		const columnToAdd: Column = {
			id: generateId(),
			title: `Column ${columns.length + 1}`,
			leads: [],
		};

		setColumns([...columns, columnToAdd]);
	}

	function generateId() {
		return Math.floor(Math.random() * 10001);
	}

	function deleteColumn(id: Id) {
		const filteredColumns = columns.filter((col) => col.id !== id);
		setColumns(filteredColumns);
	}

	function onDragStart(event: DragStartEvent) {
		if (event.active.data.current?.type === "Column") {
			setActiveColumn(event.active.data.current.column);
			return;
		}
	}

	function onDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (!over) return;

		const activeColumnId = active.id;
		const overColumnId = over.id;

		if (activeColumnId === overColumnId) return;

		setColumns((columns) => {
			const activeColumnIndex = columns.findIndex(
				(col) => col.id === activeColumnId
			);
			const overColumnIndex = columns.findIndex(
				(col) => col.id === overColumnId
			);

			return arrayMove(columns, activeColumnIndex, overColumnIndex);
		});
	}

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "70vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "70vh",
				}}
			>
				<Typography color="error">{error}</Typography>
			</Box>
		);
	}

	return (
		<>
			<Box sx={{ mb: 3 }}>
				<Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
					<Link
						underline="hover"
						color="inherit"
						href="/app/dashboard"
						sx={{ fontSize: "14px" }}
					>
						Dashboard
					</Link>
					<Typography color="text.primary" sx={{ fontSize: "14px" }}>
						Lead Pipeline
					</Typography>
				</Breadcrumbs>

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography
						variant="h5"
						sx={{
							fontWeight: 700,
							color: "text.primary",
						}}
					>
						Lead Pipeline
					</Typography>

					<Box sx={{ display: "flex", gap: 1.5 }}>
						<Button
							variant="outlined"
							color="primary"
							startIcon={<FileDownloadIcon />}
							sx={{
								textTransform: "none",
								borderRadius: "8px",
								fontWeight: "500",
								fontSize: "13px",
								py: "8px",
								px: "16px",
							}}
						>
							Export
						</Button>

						<Button
							variant="outlined"
							color="primary"
							startIcon={<FileUploadIcon />}
							sx={{
								textTransform: "none",
								borderRadius: "8px",
								fontWeight: "500",
								fontSize: "13px",
								py: "8px",
								px: "16px",
							}}
							onClick={handleClickOpen}
						>
							Import
						</Button>

						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							sx={{
								textTransform: "none",
								borderRadius: "8px",
								fontWeight: "500",
								fontSize: "13px",
								py: "8px",
								px: "16px",
								color: "#fff !important",
								boxShadow: "0 8px 16px 0 rgba(85, 105, 255, 0.24)",
							}}
						>
							Add Lead
						</Button>

						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							sx={{
								textTransform: "none",
								borderRadius: "8px",
								fontWeight: "500",
								fontSize: "13px",
								py: "8px",
								px: "16px",
								color: "#fff !important",
								boxShadow: "0 8px 16px 0 rgba(85, 105, 255, 0.24)",
							}}
							onClick={createNewColumn}
						>
							Add Column
						</Button>
					</Box>
				</Box>
			</Box>

			<Divider sx={{ mb: 3 }} />

			<Paper
				elevation={0}
				sx={{
					borderRadius: "16px",
					border: "1px solid #E5E7EB",
					overflow: "hidden",
					mb: 3,
					p: 0,
				}}
			>
				<Box
					sx={{
						p: "16px 24px",
						backgroundColor: "#F9FAFB",
						borderBottom: "1px solid #E5E7EB",
					}}
				>
					<Typography
						variant="subtitle1"
						sx={{ fontWeight: 600, color: "#212B36" }}
					>
						Lead Management
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Drag columns to reorder and manage your leads through the pipeline
					</Typography>
				</Box>

				<Box sx={{ p: 2 }}>
					<DndContext
						sensors={sensors}
						onDragStart={onDragStart}
						onDragEnd={onDragEnd}
					>
						<Box
							sx={{
								minHeight: "calc(100vh - 250px)",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<Box
								style={{
									overflowX: "auto",
									overflowY: "hidden",
									width: "100%",
									padding: "8px 4px",
								}}
							>
								<Box
									display="flex"
									flexDirection="row"
									alignItems="flex-start"
									gap="20px"
									sx={{ pb: 2 }}
								>
									<SortableContext items={columnsId}>
										{columns.map((col) => (
											<ColumnContainer
												key={col.id}
												column={col}
												deleteColumn={deleteColumn}
											/>
										))}
									</SortableContext>
								</Box>
							</Box>
						</Box>

						{typeof document !== "undefined" &&
							createPortal(
								<DragOverlay>
									{activeColumn && (
										<ColumnContainer
											column={activeColumn}
											deleteColumn={deleteColumn}
										></ColumnContainer>
									)}
								</DragOverlay>,
								document.body
							)}
					</DndContext>
				</Box>
			</Paper>

			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth
				maxWidth="lg"
				PaperProps={{
					sx: {
						borderRadius: "16px",
						boxShadow: "0px 24px 48px rgba(0, 0, 0, 0.2)",
					},
				}}
			>
				<DialogContent sx={{ p: 0 }}>
					<ImportLeadContent />
				</DialogContent>
			</Dialog>
		</>
	);
}
