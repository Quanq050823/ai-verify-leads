"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import Grid from "@mui/material/Grid";
import ToDo from "@/components/Apps/KanbanBoard/ToDo";
import Doing from "@/components/Apps/KanbanBoard/Doing";
import Done from "@/components/Apps/KanbanBoard/Done";

import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import ImportLeadContent from "./Importlead";
import { Box } from "@mui/material";
import { Column, Id } from "@/type";
import ColumnContainer from "@/components/LeadPipeline/ColumnContainer";
import { DndContext, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

export default function Page() {
	const [open, setOpen] = useState(false);
	const [columns, setColumns] = useState<Column[]>([]);
	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

	const [activeColumn, setActiveColumn] = useState<Column | null>(null);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<DndContext onDragStart={onDragStart}>
				<Box
					style={{
						minHeight: "80vh",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<Grid
						container
						justifyContent="flex-end"
						spacing={2}
						style={{ marginBottom: "16px" }}
					>
						<Grid item>
							<Button
								type="submit"
								variant="outlined"
								color="primary"
								sx={{
									textTransform: "capitalize",
									borderRadius: "8px",
									fontWeight: "500",
									fontSize: "13px",
									padding: "11px 30px",
								}}
								onClick={handleClickOpen}
							>
								<AddIcon
									sx={{
										position: "relative",
									}}
								/>{" "}
								Import
							</Button>
						</Grid>
						<Grid item>
							<Button
								type="submit"
								variant="outlined"
								color="primary"
								sx={{
									textTransform: "capitalize",
									borderRadius: "8px",
									fontWeight: "500",
									fontSize: "13px",
									padding: "11px 30px",
								}}
							>
								<AddIcon
									sx={{
										position: "relative",
									}}
								/>{" "}
								Export
							</Button>
						</Grid>
						<Grid item>
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
									}}
								/>{" "}
								Add Lead
							</Button>
						</Grid>
						<Grid item>
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
								onClick={() => {
									createNewColumn();
								}}
							>
								<AddIcon
									sx={{
										position: "relative",
									}}
								/>{" "}
								Add Column
							</Button>
						</Grid>
					</Grid>

					<Box
						style={{
							margin: "auto",
							display: "flex",
							alignItems: "center",
							overflowX: "auto",
							overflowY: "hidden",
							width: "100%",
							paddingLeft: "40px",
							paddingRight: "40px",
						}}
					>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="flex-start"
							gap="10px"
						>
							<Box
								className="w-[350px] min-w-[350px]"
								style={{
									display: "flex",
									gap: "5vh",
									marginTop: "3vh",
								}}
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
				</Box>

				{createPortal(
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
			<Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
				<DialogContent>
					<ImportLeadContent />
				</DialogContent>
			</Dialog>
		</>
	);

	function createNewColumn() {
		const columnToAdd: Column = {
			id: genetateId(),
			title: `Column ${columns.length + 1}`,
		};

		setColumns([...columns, columnToAdd]);
	}

	function genetateId() {
		return Math.floor(Math.random() * 10001);
	}

	function deleteColumn(id: Id) {
		const filteredColumns = columns.filter((col) => col.id !== id);
		setColumns(filteredColumns);
	}

	function onDragStart(event: DragStartEvent) {
		console.log("DRAG START", event);
		if (event.active.data.current?.type === "Column") {
			setActiveColumn(event.active.data.current.column);
			return;
		}
	}
}
