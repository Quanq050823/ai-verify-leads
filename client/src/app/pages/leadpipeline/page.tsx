"use client";

import { useState } from "react";
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

export default function Page() {
	const [open, setOpen] = useState(false);
	const [columns, setColumns] = useState(["Raw", "Verifying", "Scheduled"]);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
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

			<Grid container columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
				<Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
					<ToDo />
				</Grid>

				<Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
					<Doing />
				</Grid>

				<Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
					<Done />
				</Grid>
			</Grid>
			<Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
				<DialogContent>
					<ImportLeadContent />
				</DialogContent>
			</Dialog>
		</>
	);
}
