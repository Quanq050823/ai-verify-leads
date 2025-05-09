import React, { useState, ChangeEvent, DragEvent } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import HelpIcon from "@mui/icons-material/Help";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SettingsIcon from "@mui/icons-material/Settings";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tooltip from "@mui/material/Tooltip";

const VisuallyHiddenInput = styled("input")({
	clip: "rect(0 0 0 0)",
	clipPath: "inset(50%)",
	height: 1,
	overflow: "hidden",
	position: "absolute",
	bottom: 0,
	left: 0,
	whiteSpace: "nowrap",
	width: 1,
});

const UploadBox = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(5),
	textAlign: "center",
	color: theme.palette.text.secondary,
	border: `2px dashed ${
		theme.palette.mode === "dark"
			? theme.palette.grey[700]
			: theme.palette.grey[400]
	}`,
	cursor: "pointer",
	height: "100%",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	backgroundColor:
		theme.palette.mode === "dark"
			? theme.palette.grey[900]
			: theme.palette.grey[50],
	borderRadius: theme.shape.borderRadius * 2,
	transition: "all 0.3s ease-in-out",
	"&:hover": {
		borderColor: theme.palette.primary.main,
		backgroundColor:
			theme.palette.mode === "dark"
				? theme.palette.grey[800]
				: theme.palette.grey[100],
		transform: "translateY(-2px)",
		boxShadow: theme.shadows[4],
	},
}));

const ImportLeadUI = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [importType, setImportType] = useState("");
	const [notifications, setNotifications] = useState(true);
	const [fileError, setFileError] = useState("");

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
			if (fileType === "xlsx" || fileType === "csv") {
				setFile(selectedFile);
				setFileError("");
			} else {
				setFile(null);
				setFileError(
					"Invalid file format. Please upload .xlsx or .csv files only."
				);
			}
		}
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();

		const droppedFile = event.dataTransfer.files[0];
		if (droppedFile) {
			const fileType = droppedFile.name.split(".").pop()?.toLowerCase();
			if (fileType === "xlsx" || fileType === "csv") {
				setFile(droppedFile);
				setFileError("");
			} else {
				setFile(null);
				setFileError(
					"Invalid file format. Please upload .xlsx or .csv files only."
				);
			}
		}
	};

	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const handleImportTypeChange = (event: SelectChangeEvent) => {
		setImportType(event.target.value);
	};

	const handleNotificationChange = (event: ChangeEvent<HTMLInputElement>) => {
		setNotifications(event.target.checked);
	};

	return (
		<>
			<Box
				sx={{
					backgroundColor: "white",
					borderRadius: 2,
					boxShadow: 1,
					mb: 4,
					p: 2,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
				className="lead-info-dialog"
			>
				<Typography variant="h5" fontWeight="600" color="primary">
					Import Leads
				</Typography>
				<Tooltip title="View import guide">
					<Button
						variant="outlined"
						onClick={handleClickOpen}
						startIcon={<HelpIcon />}
						size="small"
					>
						Help Guide
					</Button>
				</Tooltip>
			</Box>

			<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
				<DialogTitle sx={{ borderBottom: 1, borderColor: "divider", pb: 2 }}>
					<Box display="flex" alignItems="center">
						<HelpIcon color="primary" sx={{ mr: 1 }} />
						<Typography variant="h6">Excel Import Guide</Typography>
					</Box>
				</DialogTitle>
				<DialogContent sx={{ py: 3 }}>
					<Typography variant="body1" gutterBottom>
						Follow these steps to successfully import your leads:
					</Typography>
					<Box sx={{ pl: 2, mt: 2 }}>
						<Typography variant="body1" gutterBottom>
							1. Prepare your Excel (.xlsx) or CSV (.csv) file with appropriate
							columns
						</Typography>
						<Typography variant="body1" gutterBottom>
							2. Make sure your file contains the necessary columns: Name,
							Email, Phone, Company
						</Typography>
						<Typography variant="body1" gutterBottom>
							3. Choose whether to append to existing leads or overwrite them
						</Typography>
						<Typography variant="body1" gutterBottom>
							4. Upload your file by dragging and dropping or browsing
						</Typography>
					</Box>
					<Alert severity="info" sx={{ mt: 3 }}>
						For best results, download our template and fill in your data.
					</Alert>
				</DialogContent>
				<DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
					<Button onClick={handleClose} color="primary" variant="contained">
						Close
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
						<Box
							component={Paper}
							sx={{
								p: 3,
								height: "100%",
								borderRadius: 2,
								boxShadow: 2,
							}}
						>
							<Typography
								variant="h6"
								fontWeight="600"
								gutterBottom
								sx={{
									display: "flex",
									alignItems: "center",
									mb: 2,
								}}
							>
								<CloudUploadIcon sx={{ mr: 1 }} color="primary" />
								File Upload
							</Typography>

							<Box sx={{ mt: 3 }}>
								<UploadBox
									onDrop={handleDrop}
									onDragOver={handleDragOver}
									onClick={() => {
										const fileInput = document.getElementById("file-upload");
										if (fileInput) {
											fileInput.click();
										}
									}}
								>
									<CloudUploadIcon
										sx={{
											fontSize: 60,
											color: theme.palette.primary.main,
											mb: 2,
										}}
									/>
									<Typography variant="h6" gutterBottom color="textPrimary">
										Drag & Drop File Here
									</Typography>
									<Typography
										variant="body2"
										color="textSecondary"
										gutterBottom
									>
										Supported formats: .xlsx, .csv
									</Typography>
									<Button
										component="label"
										variant="contained"
										sx={{ mt: 2 }}
										startIcon={<CloudUploadIcon />}
									>
										Browse Files
										<VisuallyHiddenInput
											id="file-upload"
											type="file"
											accept=".xlsx,.csv"
											onChange={handleFileChange}
										/>
									</Button>
								</UploadBox>

								{fileError && (
									<Alert severity="error" sx={{ mt: 2 }}>
										{fileError}
									</Alert>
								)}

								{file && (
									<Alert severity="success" sx={{ mt: 2 }}>
										File selected: {file.name}
									</Alert>
								)}
							</Box>
						</Box>
					</Grid>

					<Grid item xs={12} md={6}>
						<Box
							component={Paper}
							sx={{
								p: 3,
								height: "100%",
								borderRadius: 2,
								boxShadow: 2,
							}}
						>
							<Typography
								variant="h6"
								fontWeight="600"
								gutterBottom
								sx={{
									display: "flex",
									alignItems: "center",
									mb: 2,
								}}
							>
								<SettingsIcon sx={{ mr: 1 }} color="primary" />
								Import Settings
							</Typography>

							<Box sx={{ mt: 3 }}>
								<FormControl fullWidth variant="outlined" margin="normal">
									<InputLabel id="import-type-label">Import Type</InputLabel>
									<Select
										labelId="import-type-label"
										id="import-type"
										value={importType}
										onChange={handleImportTypeChange}
										label="Import Type"
									>
										<MenuItem value="" disabled>
											Select Import Type
										</MenuItem>
										<MenuItem value="append">
											<Typography variant="body2" fontWeight="medium">
												Append
											</Typography>
										</MenuItem>
										<MenuItem value="overwrite">
											<Typography variant="body2" fontWeight="medium">
												Overwrite
											</Typography>
										</MenuItem>
									</Select>
								</FormControl>

								<Box sx={{ mt: 3 }}>
									<FormControlLabel
										control={
											<Switch
												checked={notifications}
												onChange={handleNotificationChange}
												color="primary"
											/>
										}
										label={
											<Box>
												<Typography variant="body2">
													Enable Notifications
												</Typography>
												<Typography variant="caption" color="textSecondary">
													Receive email when import is complete
												</Typography>
											</Box>
										}
									/>
								</Box>

								<Button
									variant="contained"
									color="primary"
									fullWidth
									size="large"
									disabled={!file || !importType}
									sx={{
										mt: 4,
										textTransform: "none",
										borderRadius: 1.5,
										py: 1.5,
									}}
								>
									Import Leads
								</Button>

								{(!file || !importType) && (
									<Typography
										variant="caption"
										color="error"
										display="block"
										sx={{ mt: 1, textAlign: "center" }}
									>
										{!file
											? "Please select a file first"
											: "Please select an import type"}
									</Typography>
								)}
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Box>
		</>
	);
};

export default ImportLeadUI;
