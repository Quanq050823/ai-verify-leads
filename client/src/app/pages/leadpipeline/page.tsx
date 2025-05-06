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
	TextField,
	InputAdornment,
	Select,
	SelectChangeEvent,
	MenuItem,
	FormControl,
	InputLabel,
	Chip,
	IconButton,
	styled,
	alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import RefreshIcon from "@mui/icons-material/Refresh";
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
	closestCorners,
	DragCancelEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { getLeads, fetchLeadsByNodes } from "../../../services/leadServices";
import { getNodeIcon, getNodeColor } from "@/utils/nodeUtils";

// Extend the Column type to include nodeType
interface ExtendedColumn extends Column {
	nodeType?: string;
	iconColor?: string;
}

// Mở rộng kiểu Lead để bao gồm nodeBase
interface ProcessedLead extends Lead {
	nodeBase?: string;
}

// Custom styled components
const SearchTextField = styled(TextField)(({ theme }) => ({
	"& .MuiOutlinedInput-root": {
		borderRadius: "10px",
		backgroundColor: alpha(theme.palette.common.white, 0.9),
		"&:hover": {
			backgroundColor: theme.palette.common.white,
		},
		"&.Mui-focused": {
			backgroundColor: theme.palette.common.white,
		},
	},
}));

const ColorChip = styled(Chip)(({ theme }) => ({
	borderRadius: "8px",
	fontWeight: 500,
	fontSize: "0.75rem",
	height: "24px",
}));

const IconBox = styled(Box)(({ theme }) => ({
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	width: "40px",
	height: "40px",
	borderRadius: "8px",
	color: "white",
	marginRight: "12px",
}));

const nodeTypeColors: Record<string, string> = {
	email: "#00BCD4",
	facebook: "#1877f2",
	facebookleadads: "#1877f2",
	sendwebhook: "#8b5cf6",
	delay: "#795548",
	conditional: "#f59e0b",
	condition: "#f59e0b",
	sms: "#8BC34A",
	googlesheets: "#0F9D58",
	aicall: "#10b981",
	googlecalendar: "#4285f4",
	config: "#795548",
	error: "#F44336",
	default: "#9E9E9E",
};

export default function LeadPipelinePage() {
	const [open, setOpen] = useState(false);
	const [columns, setColumns] = useState<ExtendedColumn[]>([]);
	const [leads, setLeads] = useState<ProcessedLead[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");
	const [nodeTypes, setNodeTypes] = useState<string[]>([]);

	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
	const [activeColumn, setActiveColumn] = useState<ExtendedColumn | null>(null);

	// Configure sensor with strict constraints
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 1, // Tăng khoảng cách kích hoạt để tránh kích hoạt vô tình
				tolerance: 0, // Thêm dung sai để tránh kích hoạt do rung nhẹ
				delay: 0, // Thêm độ trễ để tránh kích hoạt ngay lập tức
			},
		})
	);

	// Prevent drag operations when dialogs are open
	useEffect(() => {
		// Create a CSS class to disable pointer events on drag handles when dialog is open
		if (typeof document !== "undefined") {
			const style = document.createElement("style");
			style.id = "dnd-disable-style";

			if (open) {
				// Disable drag handles when dialog is open
				style.innerHTML = `
					.column-header {
						cursor: default !important;
						pointer-events: none !important;
					}
					.dndkit-sortable-handle {
						cursor: default !important;
						pointer-events: none !important;
					}
				`;
				document.head.appendChild(style);
			} else {
				// Remove style if already exists
				const existingStyle = document.getElementById("dnd-disable-style");
				if (existingStyle) {
					existingStyle.remove();
				}
			}

			return () => {
				const existingStyle = document.getElementById("dnd-disable-style");
				if (existingStyle) {
					existingStyle.remove();
				}
			};
		}
	}, [open]);

	// Xử lý huỷ sự kiện kéo thả khi có lỗi
	const handleDragCancel = (event: DragCancelEvent) => {
		setActiveColumn(null);
	};

	// Override default drag behavior
	const handleDragStart = (event: DragStartEvent) => {
		// Prevent drag if dialog is open
		if (open) {
			// Không thể cancel trực tiếp, nhưng ta đã vô hiệu hóa kéo thả thông qua CSS
			// và không thiết lập activeColumn nên sẽ không có hiệu ứng kéo thả
			return;
		}

		if (event.active.data.current?.type === "Column") {
			setActiveColumn(event.active.data.current.column);
		}
	};

	function onDragEnd(event: DragEndEvent) {
		setActiveColumn(null);

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

	// Fetch leads data and organize by node type
	useEffect(() => {
		const loadLeads = async () => {
			setLoading(true);
			try {
				// Tải leads từ API
				let data = await getLeads();
				console.log("All leads:", data);

				// Xử lý dữ liệu sau khi tải
				processLeadData(data);
			} catch (err) {
				console.error("Error loading leads:", err);
				setError("Failed to load leads. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		loadLeads();
	}, []);

	// Xử lý dữ liệu lead và tạo cột
	const processLeadData = (data: Lead[]) => {
		// 1. Trích xuất và chuẩn hóa nodeType từ mỗi lead
		const processedLeads: ProcessedLead[] = data.map((lead) => ({
			...lead,
			// Thêm trường nodeBase để tránh tính toán lặp lại
			nodeBase: extractNodeBase(lead.nodeId),
		}));

		// 2. Tìm các loại node duy nhất
		const uniqueNodeTypes = Array.from(
			new Set(processedLeads.map((lead) => lead.nodeBase || "unassigned"))
		);
		console.log("Unique node types:", uniqueNodeTypes);
		setNodeTypes(uniqueNodeTypes);

		// 3. Tạo cột cho mỗi loại node
		if (columns.length === 0 && uniqueNodeTypes.length > 0) {
			const initialColumns: ExtendedColumn[] = uniqueNodeTypes.map(
				(nodeType, index) => {
					const baseType = getBaseNodeType(nodeType);
					return {
						id: index + 1,
						title: nodeType,
						nodeType: nodeType,
						iconColor: getNodeTypeColor(baseType),
					};
				}
			);
			console.log("Initial columns:", initialColumns);
			setColumns(initialColumns);
		}

		// 4. Lưu leads đã xử lý
		setLeads(processedLeads);
	};

	// Trích xuất phần cơ bản từ nodeId
	const extractNodeBase = (nodeId: string | undefined): string => {
		if (!nodeId) return "unassigned";
		const parts = nodeId.split("_");
		return normalizeNodeType(parts[0]);
	};

	// Extract the base node type from a nodeId
	const getBaseNodeType = (nodeType: string): string => {
		if (!nodeType || nodeType === "unassigned") return "default";

		// Xử lý nodeId có format nodeType_id
		const parts = nodeType.split("_");
		const baseType = parts[0].toLowerCase();

		console.log(
			"getBaseNodeType input:",
			nodeType,
			"extracted base:",
			baseType
		);

		// Map các nodeId cụ thể về các loại node chuẩn
		const baseTypeMapping: Record<string, string> = {
			facebookleads: "facebookleadads",
			form: "googlesheets",
			sheet: "googlesheets",
			google: "googlesheets",
			calendar: "googlecalendar",
			ai: "aicall",
			sendwebhook: "sendwebhook",
			verification: "condition",
		};

		const result = baseTypeMapping[baseType] || baseType;
		console.log("getBaseNodeType result:", result);
		return result;
	};

	// Get appropriate color for a node type
	const getNodeTypeColor = (baseType: string): string => {
		return nodeTypeColors[baseType] || nodeTypeColors.default;
	};

	// Function to convert nodeId to a more readable name
	const getNodeTypeDisplayName = (nodeType: string): string => {
		if (!nodeType || nodeType === "unassigned") return "Unassigned";

		// Chỉ lấy phần nodeType (trước dấu gạch dưới)
		const parts = nodeType.split("_");
		return parts[0];
	};

	// Distribute leads to columns based on node type
	useEffect(() => {
		if (leads.length > 0 && columns.length > 0) {
			console.log(
				"Distributing leads:",
				leads.length,
				"to columns:",
				columns.length
			);

			const updatedColumns = columns.map((column) => {
				// Trích xuất nodeBase của cột (chỉ cần làm một lần)
				const columnNodeBase = column.nodeType
					? normalizeNodeType(column.nodeType.split("_")[0])
					: null;

				// Filter leads based on node type
				const columnLeads = leads.filter((lead) => {
					// Filter by search term if present
					const matchesSearch = searchTerm
						? (lead.leadData?.["full name"] || "")
								.toLowerCase()
								.includes(searchTerm.toLowerCase()) ||
						  (lead.leadData?.email || "")
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						: true;

					// So sánh nodeBase đã được tính toán trước
					const nodeTypeMatch = columnNodeBase
						? lead.nodeBase === columnNodeBase
						: lead.nodeBase === "unassigned";

					// Debug aiCall nodes
					if (lead.nodeBase?.includes("aicall")) {
						console.log(
							`Lead nodeId: ${lead.nodeId}, Base: ${lead.nodeBase}`,
							`Column nodeType: ${column.nodeType}, Base: ${columnNodeBase}`,
							`Match: ${nodeTypeMatch}`
						);
					}

					// Filter by status if filter type is not "all"
					const statusMatch =
						filterType === "all"
							? true
							: lead.status === parseInt(filterType, 10);

					return matchesSearch && nodeTypeMatch && statusMatch;
				});

				console.log(
					`Column ${column.nodeType || "unknown"} has ${
						columnLeads.length
					} leads`
				);

				return {
					...column,
					leads: columnLeads,
				};
			});

			setColumns(updatedColumns);
		}
	}, [leads, searchTerm, filterType]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handleFilterChange = (event: SelectChangeEvent<string>) => {
		setFilterType(event.target.value);
	};

	const handleRefresh = async () => {
		setLoading(true);
		try {
			const data = await getLeads();
			console.log("Refreshed leads:", data);
			processLeadData(data);
		} catch (err) {
			console.error("Error refreshing leads:", err);
			setError("Failed to refresh leads. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	function createNewColumn() {
		const columnToAdd: ExtendedColumn = {
			id: generateId(),
			title: `Custom Column ${columns.length + 1}`,
			leads: [],
			iconColor: "#9e9e9e",
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

	// Method to render the node icon for a column header
	const renderNodeIcon = (nodeType: string | undefined) => {
		if (!nodeType || nodeType === "unassigned") {
			return getNodeIcon("default");
		}

		const baseType = getBaseNodeType(nodeType);
		const iconMappings: Record<string, string> = {
			facebookleadads: "facebookLeadAds",
			facebookads: "facebookAds",
			facebook: "facebookLeadAds",
			email: "email",
			sms: "sms",
			condition: "condition",
			googlesheets: "googleSheets",
			aicall: "aiCall",
			config: "config",
			sendwebhook: "sendWebhook",
			conditional: "condition",
			error: "error",
			googlecalendar: "googleCalendar",
			delay: "config",
		};

		return getNodeIcon(iconMappings[baseType] || "default");
	};

	// Normalize node type to ensure consistent casing
	const normalizeNodeType = (nodeType: string): string => {
		// Rule: first lowercase everything, then capitalize the first letter
		if (!nodeType) return "";

		// Handle camelCase (like "aiCall") specially
		if (/^[a-z]+[A-Z]/.test(nodeType)) {
			return nodeType; // Keep camelCase as is
		}

		return nodeType.toLowerCase();
	};

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

	// Custom ColumnContainer renderer
	const renderCustomColumnContainer = (column: ExtendedColumn) => {
		// Create a modified column with custom header rendering
		const enhancedColumn = {
			...column,
			renderHeader: () => (
				<Box
					sx={{ display: "flex", alignItems: "center" }}
					className="column-header"
				>
					<IconBox
						sx={{
							backgroundColor: column.iconColor || "#9e9e9e",
							width: 32,
							height: 32,
						}}
					>
						{renderNodeIcon(column.nodeType)}
					</IconBox>
					<Typography
						variant="subtitle1"
						sx={{
							fontWeight: 600,
							fontSize: "15px",
							color: "#121828",
						}}
					>
						{column.nodeType
							? getNodeTypeDisplayName(column.nodeType)
							: column.title}
					</Typography>
				</Box>
			),
		};

		return (
			<ColumnContainer
				key={column.id}
				column={{
					...enhancedColumn,
					title: (
						<Box
							sx={{ display: "flex", alignItems: "center" }}
							className="column-header"
						>
							<IconBox
								sx={{
									backgroundColor: column.iconColor || "#9e9e9e",
									width: 32,
									height: 32,
								}}
							>
								{renderNodeIcon(column.nodeType)}
							</IconBox>
							<Typography component="span" sx={{ ml: 1 }}>
								{column.nodeType
									? getNodeTypeDisplayName(column.nodeType)
									: column.title}
							</Typography>
						</Box>
					),
				}}
				deleteColumn={deleteColumn}
			/>
		);
	};

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
					<Typography variant="body2" color="text.secondary">
						Leads are organized by the node type where they entered the system
					</Typography>

					{/* Search and filter controls */}
					<Box sx={{ mt: 2, display: "flex", gap: 2 }}>
						<SearchTextField
							placeholder="Search leads..."
							size="small"
							value={searchTerm}
							onChange={handleSearchChange}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon color="action" fontSize="small" />
									</InputAdornment>
								),
							}}
							sx={{ minWidth: "250px" }}
						/>

						<FormControl size="small" sx={{ minWidth: "150px" }}>
							<InputLabel id="status-filter-label">Status</InputLabel>
							<Select
								labelId="status-filter-label"
								value={filterType}
								label="Status"
								onChange={handleFilterChange}
							>
								<MenuItem value="all">All Statuses</MenuItem>
								<MenuItem value="1">Pending</MenuItem>
								<MenuItem value="2">In Progress</MenuItem>
								<MenuItem value="3">Success</MenuItem>
								<MenuItem value="9">Done</MenuItem>
							</Select>
						</FormControl>

						{/* Status indicator chips */}
						<Box
							sx={{
								display: "flex",
								gap: 1,
								alignItems: "center",
								ml: "auto",
							}}
						>
							<IconButton
								size="small"
								onClick={handleRefresh}
								title="Refresh leads"
							>
								<RefreshIcon />
							</IconButton>
						</Box>
					</Box>
				</Box>

				<Box sx={{ p: 2 }}>
					<DndContext
						sensors={sensors}
						onDragStart={handleDragStart}
						onDragEnd={onDragEnd}
						onDragCancel={handleDragCancel}
						collisionDetection={closestCorners}
					>
						<Box
							sx={{
								minHeight: "calc(100vh - 300px)",
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
										{columns.map((column) => (
											<ColumnContainer
												key={column.id}
												column={{
													...column,
													title: (
														<Box
															sx={{ display: "flex", alignItems: "center" }}
															className="column-header"
														>
															<IconBox
																sx={{
																	backgroundColor:
																		column.iconColor || "#9e9e9e",
																	width: 32,
																	height: 32,
																}}
															>
																{renderNodeIcon(column.nodeType)}
															</IconBox>
															<Typography component="span" sx={{ ml: 1 }}>
																{column.nodeType
																	? getNodeTypeDisplayName(column.nodeType)
																	: column.title}
															</Typography>
														</Box>
													),
												}}
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
											column={{
												...activeColumn,
												title: (
													<Box
														sx={{ display: "flex", alignItems: "center" }}
														className="column-header"
													>
														<IconBox
															sx={{
																backgroundColor:
																	activeColumn.iconColor || "#9e9e9e",
																width: 32,
																height: 32,
															}}
														>
															{renderNodeIcon(activeColumn.nodeType)}
														</IconBox>
														<Typography component="span" sx={{ ml: 1 }}>
															{activeColumn.nodeType
																? getNodeTypeDisplayName(activeColumn.nodeType)
																: activeColumn.title}
														</Typography>
													</Box>
												),
											}}
											deleteColumn={deleteColumn}
										/>
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
