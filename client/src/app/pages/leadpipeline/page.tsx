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
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
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
import { useFlow } from "@/context/FlowContext";
import FlowSelector from "@/components/common/FlowSelector";

// Extend the Column type to include nodeType
interface ExtendedColumn extends Column {
	nodeType?: string;
	iconColor?: string;
	filterByStatus?: number; // Thêm trường này để lọc theo status
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
	fail: "#FF5252",
	success: "#4CAF50",
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
	const { selectedFlowId } = useFlow();

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

	const handleDragCancel = (event: DragCancelEvent) => {
		setActiveColumn(null);
	};

	const handleDragStart = (event: DragStartEvent) => {
		if (open) {
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

	// Lưu trữ tất cả leads để có thể lọc lại
	const [allLeads, setAllLeads] = useState<Lead[]>([]);

	// Fetch leads data and organize by node type
	useEffect(() => {
		const loadLeads = async () => {
			setLoading(true);
			try {
				// Lấy tất cả leads thay vì lọc theo flowId
				let data = await getLeads();
				console.log("All leads:", data);

				// Lưu tất cả leads vào state
				setAllLeads(data);
				processLeadData(data);
			} catch (err) {
				console.error("Error loading leads:", err);
				setError("Failed to load leads. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		// Reset columns khi khởi động component
		setColumns([]);
		loadLeads();
	}, []);

	// Xử lý dữ liệu lead và tạo cột
	const processLeadData = (data: Lead[]) => {
		// Lọc dữ liệu theo flowId nếu có
		const filteredData = selectedFlowId
			? data.filter((lead) => lead.flowId === selectedFlowId)
			: data;

		// 1. Trích xuất và chuẩn hóa nodeType từ mỗi lead
		const processedLeads: ProcessedLead[] = filteredData.map((lead) => ({
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
			// Lọc bỏ facebook ads từ danh sách node types
			const filteredNodeTypes = uniqueNodeTypes.filter(
				(nodeType) => !nodeType.toLowerCase().includes("facebookleadads")
			);

			const initialColumns: ExtendedColumn[] = filteredNodeTypes.map(
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

			initialColumns.push({
				id: initialColumns.length + 1,
				title: "Fail",
				nodeType: "fail",
				iconColor: nodeTypeColors.fail,
				filterByStatus: 0, // Status 0 cho Fail
			});

			initialColumns.push({
				id: initialColumns.length + 2,
				title: "Success",
				nodeType: "success",
				iconColor: nodeTypeColors.success,
				filterByStatus: 9, // Status 9 cho Success
			});

			console.log("Initial columns:", initialColumns);
			setColumns(initialColumns);
		}

		setLeads(processedLeads);
	};

	const extractNodeBase = (nodeId: string | undefined): string => {
		if (!nodeId) return "unassigned";

		if (nodeId.toLowerCase().includes("facebookleadads")) {
			return "hidden"; // Gán một giá trị đặc biệt để lead này không hiển thị
		}

		const parts = nodeId.split("_");
		return normalizeNodeType(parts[0]);
	};

	const getBaseNodeType = (nodeType: string): string => {
		if (!nodeType || nodeType === "unassigned") return "default";

		const parts = nodeType.split("_");
		const baseType = parts[0].toLowerCase();

		console.log(
			"getBaseNodeType input:",
			nodeType,
			"extracted base:",
			baseType
		);

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

	const getNodeTypeColor = (baseType: string): string => {
		return nodeTypeColors[baseType] || nodeTypeColors.default;
	};

	const getNodeTypeDisplayName = (nodeType: string): string => {
		if (!nodeType || nodeType === "unassigned") return "Unassigned";
		if (nodeType === "fail") return "Fail";
		if (nodeType === "success") return "Success";
		if (nodeType === "aiCall") return "AI Call";
		if (nodeType === "sendWebhook") return "Sending Webhook";
		if (nodeType === "googleCalendar") return "Booking Meet";
		if (nodeType === "facebookLeadAds") return "Get Lead Data";
		const parts = nodeType.split("_");
		return parts[0];
	};

	useEffect(() => {
		if (leads.length > 0 && columns.length > 0) {
			console.log(
				"Distributing leads:",
				leads.length,
				"to columns:",
				columns.length
			);

			const updatedColumns = columns.map((column) => {
				const columnNodeBase = column.nodeType
					? normalizeNodeType(column.nodeType.split("_")[0])
					: null;

				const columnLeads = leads.filter((lead) => {
					if (
						lead.nodeBase &&
						lead.nodeBase.toLowerCase().includes("facebookleadads")
					) {
						return false;
					}

					const matchesSearch = searchTerm
						? (lead.leadData?.["full name"] || "")
								.toLowerCase()
								.includes(searchTerm.toLowerCase()) ||
						  (lead.leadData?.email || "")
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						: true;

					if (column.filterByStatus !== undefined) {
						return matchesSearch && lead.status === column.filterByStatus;
					}
					if (lead.status === 0 || lead.status === 9) {
						return false;
					}

					const nodeTypeMatch = columnNodeBase
						? lead.nodeBase === columnNodeBase
						: lead.nodeBase === "unassigned";

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

	// Theo dõi thay đổi của flowId để lọc lại dữ liệu
	useEffect(() => {
		if (allLeads.length > 0) {
			console.log("Filtering leads by flowId:", selectedFlowId);
			// Lọc lại dữ liệu sử dụng tất cả leads đã lưu
			processLeadData(allLeads);
		}
	}, [selectedFlowId, allLeads]);

	const handleRefresh = async () => {
		setLoading(true);
		try {
			const data = await getLeads();
			console.log("Refreshed leads:", data);
			// Lưu tất cả leads vào state
			setAllLeads(data);
			// Xử lý dữ liệu với flowId hiện tại
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

		// Thêm icons cho các cột Fail và Success
		if (nodeType === "fail") {
			return getNodeIcon("error");
		}

		if (nodeType === "success") {
			return getNodeIcon("verified");
		}

		const baseType = getBaseNodeType(nodeType);
		const iconMappings: Record<string, string> = {
			facebookleadads: "facebookLeadAds",
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

	const normalizeNodeType = (nodeType: string): string => {
		if (!nodeType) return "";

		if (/^[a-z]+[A-Z]/.test(nodeType)) {
			return nodeType; // Keep camelCase as is
		}

		return nodeType.toLowerCase();
	};

	const renderCustomColumnContainer = (column: ExtendedColumn) => {
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
			<Box sx={{ minHeight: "85vh" }}>
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
					</Box>
				</Box>

				<Divider sx={{ mb: 3 }} />

				{/* Flow Selector */}
				<Paper
					elevation={0}
					sx={{
						p: 3,
						mb: 3,
						borderRadius: 2,
						backgroundColor: "background.paper",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					}}
					className="lighter-bg"
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							gap: 2,
							alignItems: { xs: "flex-start", md: "center" },
							justifyContent: "space-between",
						}}
					>
						<Box>
							<Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
								Select Flow to View Leads
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Lead pipeline data will be filtered according to the flow you
								choose.
							</Typography>
						</Box>

						<Box>
							<FlowSelector />
							{!loading && (
								<Box sx={{ mt: 1, textAlign: "right" }}>
									<Typography variant="caption" color="text.secondary">
										{selectedFlowId
											? `Showing ${leads.length} leads for selected flow`
											: `Showing all ${leads.length} leads`}
									</Typography>
								</Box>
							)}
						</Box>
					</Box>
				</Paper>

				<Paper elevation={0} sx={{ mb: 3 }} className={"lighter-bg"}>
					<Box
						sx={{
							borderTopRightRadius: "12px",
							borderTopLeftRadius: "12px",
							p: "16px 24px",
							overflow: "hidden",
						}}
						className={"flow-card-header"}
					>
						<Box sx={{ mt: 2, display: "flex", gap: 2 }}>
							<Box sx={{ display: "flex", flexDirection: "row" }}>
								<Box
									sx={{
										display: "flex",
										gap: 1,
										alignItems: "center",
										ml: "auto",
									}}
								>
									<IconButton size="small" title="Search leads">
										<SearchIcon />
									</IconButton>
								</Box>
								<SearchTextField
									placeholder="Search leads..."
									size="small"
									value={searchTerm}
									onChange={handleSearchChange}
									className="white-text"
									sx={{ minWidth: "250px" }}
								/>

								<FormControl
									size="small"
									sx={{ minWidth: "150px", marginLeft: "20px" }}
								>
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
							</Box>

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

					<Box
						sx={{
							p: 2,
							borderBottomLeftRadius: "12px",
							borderBottomRightRadius: "12px",
							overflow: "hidden",
						}}
						className={"lead-board-insight"}
					>
						{loading ? (
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									height: "200px",
									width: "100%",
								}}
							>
								<CircularProgress />
							</Box>
						) : error ? (
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									height: "200px",
									width: "100%",
								}}
							>
								<Typography color="error">{error}</Typography>
							</Box>
						) : leads.length === 0 ? (
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
									alignItems: "center",
									height: "200px",
									width: "100%",
								}}
							>
								<Typography
									variant="body1"
									color="text.secondary"
									sx={{ mb: 1 }}
								>
									{selectedFlowId
										? "No leads found for this flow"
										: "No leads found. You can view all leads or select a specific flow."}
								</Typography>
								{selectedFlowId && allLeads.length > 0 && (
									<Typography variant="body2" color="text.secondary">
										There are {allLeads.length} leads in the system. Try
										selecting a different flow.
									</Typography>
								)}
							</Box>
						) : (
							<DndContext
								sensors={sensors}
								onDragStart={handleDragStart}
								onDragEnd={onDragEnd}
								onDragCancel={handleDragCancel}
								collisionDetection={closestCorners}
							>
								<Box
									sx={{
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
																		? getNodeTypeDisplayName(
																				activeColumn.nodeType
																		  )
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
						)}
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
			</Box>
		</>
	);
}
