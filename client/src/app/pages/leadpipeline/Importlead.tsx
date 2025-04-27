import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import HelpIcon from "@mui/icons-material/Help";

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

const ImportLeadUI = () => {
	const [open, setOpen] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<div
				className="breadcrumb-card"
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h5>Import Leads</h5>
				<Button variant="outlined" onClick={handleClickOpen}>
					<HelpIcon
						sx={{
							position: "relative",
							paddingRight: "5px",
						}}
					/>{" "}
					Hướng dẫn
				</Button>
			</div>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Hướng dẫn nhập tệp Excel</DialogTitle>
				<DialogContent>
					<Typography variant="body1">
						Đây là hướng dẫn chi tiết về cách nhập tệp Excel...
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Đóng
					</Button>
				</DialogActions>
			</Dialog>
			<Box
				sx={{
					mx: "auto",
					mb: 4,
				}}
			>
				<Grid container spacing={3}>
					<Grid item xs={12} md={6}>
						<UploadBox>
							<Typography variant="h6">Upload File</Typography>
							<Typography variant="body1">
								Drag and drop your file here, or click to browse
							</Typography>
							<Typography variant="body2">
								Supported formats: .xlsx, .csv
							</Typography>
							<Button
								variant="contained"
								component="label"
								style={{ marginTop: "20px" }}
							>
								Choose file
								<input type="file" hidden />
							</Button>
						</UploadBox>
					</Grid>
					<Grid item xs={12} md={6}>
						<Box sx={{ p: 2 }}>
							<Typography variant="h6">Import Settings</Typography>
							<Select
								fullWidth
								variant="outlined"
								margin="dense"
								defaultValue=""
								displayEmpty
							>
								<MenuItem value="" disabled>
									Select Import Type
								</MenuItem>
								<MenuItem value="append">Append</MenuItem>
								<MenuItem value="overwrite">Overwrite</MenuItem>
							</Select>
							<Box display="flex" alignItems="center" mt={2} gap={1}>
								<Typography variant="body2">Enable Notifications</Typography>
								<Switch />
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Box>
		</>
	);
};
export default ImportLeadUI;
