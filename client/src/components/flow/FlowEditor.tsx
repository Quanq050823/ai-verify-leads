import React, { useState, useCallback, useRef, useEffect } from "react";
import {
	ReactFlow,
	ReactFlowProvider,
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	Panel,
	Connection,
	Edge,
	Node,
	useReactFlow,
	MarkerType,
	ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@/styles/reactflow-theme.css"; // Import custom theme
import {
	Box,
	CssBaseline,
	LinearProgress,
	ThemeProvider,
	createTheme,
	Paper,
	Typography,
	CircularProgress,
	Backdrop,
	Snackbar,
	Alert,
	IconButton,
	Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import {
	Map as MapIcon,
	VisibilityOff,
	DarkMode as DarkModeIcon,
	LightMode as LightModeIcon,
} from "@mui/icons-material";

import Sidebar from "./Sidebar";
import PropertiesPanel from "./PropertiesPanel";
import CustomEdge from "./edges/CustomEdge";
import FlowToolbar from "./FlowToolbar";
import {
	GoogleSheetsNode,
	AICallNode,
	CalendarNode,
	WebhookNode,
	ConditionNode,
	EmailNode,
	SMSNode,
	ConfigNode,
	ErrorNode,
	FacebookLeadAdsNode,
} from "./nodes/NodeTypes";
import { CustomEdgeData } from "./edges/CustomEdge";
import { getFlowById, createFlow, updateFlow } from "@/services/flowServices";
import { useTheme } from "@/context/ThemeContext";

// Define MUI themes
const getLightTheme = () =>
	createTheme({
		palette: {
			mode: "light",
			primary: {
				main: "#3b82f6",
			},
			secondary: {
				main: "#10b981",
			},
			error: {
				main: "#ef4444",
			},
			warning: {
				main: "#f59e0b",
			},
			info: {
				main: "#6366f1",
			},
			success: {
				main: "#22c55e",
			},
		},
	});

const getDarkTheme = () =>
	createTheme({
		palette: {
			mode: "dark",
			primary: {
				main: "#60a5fa",
			},
			secondary: {
				main: "#34d399",
			},
			error: {
				main: "#f87171",
			},
			warning: {
				main: "#fbbf24",
			},
			info: {
				main: "#818cf8",
			},
			success: {
				main: "#4ade80",
			},
			background: {
				default: "#1e293b",
				paper: "#334155",
			},
			text: {
				primary: "#f1f5f9",
				secondary: "#cbd5e1",
			},
		},
	});

// Define node types
const nodeTypes = {
	googleSheets: GoogleSheetsNode,
	facebookLeadAds: FacebookLeadAdsNode,
	aiCall: AICallNode,
	googleCalendar: CalendarNode,
	sendWebhook: WebhookNode,
	condition: ConditionNode,
	preVerify: ConditionNode,
	email: EmailNode,
	sms: SMSNode,
	config: ConfigNode,
	error: ErrorNode,
};

// Define edge types
const edgeTypes = {
	custom: CustomEdge,
};

const defaultEdgeOptions = {
	type: "custom",
	markerEnd: {
		type: MarkerType.ArrowClosed,
		width: 20,
		height: 20,
	},
	animated: true,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface FlowData {
	nodes: Node[];
	edges: Edge[];
}

interface FlowEditorProps {
	flowId: string | null;
}

const FlowEditorContent: React.FC<FlowEditorProps> = ({ flowId }) => {
	const { isDarkMode, toggleTheme } = useTheme();
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [progressPercent, setProgressPercent] = useState<number>(0);
	const [showPropertiesPanel, setShowPropertiesPanel] =
		useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [flowName, setFlowName] = useState<string>("New Flow");
	const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
	const [alertInfo, setAlertInfo] = useState<{
		open: boolean;
		severity: "success" | "error";
		message: string;
	}>({ open: false, severity: "success", message: "" });

	const reactFlowUtil = useReactFlow();

	// Tải dữ liệu flow từ API khi component được mount
	useEffect(() => {
		const loadFlowData = async () => {
			if (!flowId) return;

			try {
				setLoading(true);
				const flowData = await getFlowById(flowId);

				if (flowData && flowData.nodeData) {
					// Cập nhật nodes và edges từ dữ liệu API
					setNodes(flowData.nodeData.nodes || []);
					setEdges(flowData.nodeData.edges || []);
					// Lưu tên flow
					if (flowData.name) {
						setFlowName(flowData.name);
					}
				}
			} catch (error) {
				console.error("Error loading flow data:", error);
			} finally {
				setLoading(false);
			}
		};

		loadFlowData();
	}, [flowId, setNodes, setEdges]);

	// Handle node drag from sidebar
	const onDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault();

			const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
			const type = event.dataTransfer.getData("application/reactflow");

			// Check if the dropped element is valid
			if (
				typeof type === "undefined" ||
				!type ||
				!reactFlowBounds ||
				!reactFlowInstance
			) {
				return;
			}

			// Use screenToFlowPosition instead of project
			const position = reactFlowInstance.screenToFlowPosition({
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			});

			// Create a unique ID
			const id = `${type}_${Date.now()}`;

			const newNode: Node = {
				id,
				type,
				position,
				data: {
					label: getNodeLabel(type),
					description: getNodeDescription(type),
					settings: {},
				},
			};

			setNodes((nds) => nds.concat(newNode));
		},
		[reactFlowInstance, setNodes]
	);

	// Helper function to get node label based on type
	const getNodeLabel = (type: string): string => {
		switch (type) {
			case "googleSheets":
				return "Google Sheets";
			case "facebookLeadAds":
				return "Facebook Lead Ads";
			case "aiCall":
				return "AI Call";
			case "googleCalendar":
				return "Google Calendar";
			case "sendWebhook":
				return "Send to webhook";
			case "condition":
				return "Condition";
			case "preVerify":
				return "Pre-Verify";
			case "email":
				return "Send Email";
			case "sms":
				return "Send SMS";
			case "config":
				return "Configuration";
			case "error":
				return "Error Handler";
			default:
				console.warn(`Unknown node type: ${type}`);
				return type || "Unknown Node";
		}
	};

	// Helper function to get node description based on type
	const getNodeDescription = (type: string): string => {
		switch (type) {
			case "googleSheets":
				return "Import leads from Google Sheets";
			case "facebookLeadAds":
				return "Import leads from Facebook Lead Ads";
			case "aiCall":
				return "Process data with AI";
			case "googleCalendar":
				return "Schedule appointments";
			case "sendWebhook":
				return "Send lead data to a webhook";
			case "condition":
				return "Branch based on conditions";
			case "preVerify":
				return "Pre-verify leads before processing";
			case "email":
				return "Send email notification";
			case "sms":
				return "Send SMS notification";
			case "config":
				return "Configure flow settings";
			case "error":
				return "Handle errors in the flow";
			default:
				return `Node type: ${type}`;
		}
	};

	// Handle connection between nodes
	const onConnect = useCallback(
		(params: Connection) => {
			const newEdgeId = `e_${params.source}_${params.target}_${Date.now()}`;
			const sourceNodeId = params.source?.split("_")[0].toLowerCase();

			// Xác định loại node nguồn có nhiều đầu ra
			const isMultiOutputNode =
				sourceNodeId === "condition" ||
				sourceNodeId === "preverify" ||
				sourceNodeId === "aicall";

			// Tạo nhãn cho cạnh dựa trên loại node và handle
			let edgeLabel = "";
			if (isMultiOutputNode) {
				if (params.sourceHandle === "output-0") {
					edgeLabel = "success";
				} else if (params.sourceHandle === "output-1") {
					edgeLabel = "fail";
				}
			}

			// Tạo edge mới với CustomEdgeData
			const newEdge: Edge<CustomEdgeData> = {
				...params,
				id: newEdgeId,
				data: {
					label: edgeLabel,
				},
			};

			setEdges((eds) => {
				let filteredEdges = [...eds];

				if (isMultiOutputNode) {
					// Đối với node có nhiều đầu ra, chỉ xóa các cạnh có cùng sourceHandle
					// Điều này cho phép mỗi đầu ra của node có một kết nối duy nhất
					filteredEdges = filteredEdges.filter(
						(edge) =>
							!(
								edge.source === params.source &&
								edge.sourceHandle === params.sourceHandle
							)
					);
				} else {
					// Đối với các node khác, xóa tất cả kết nối từ source node
					filteredEdges = filteredEdges.filter(
						(edge) => edge.source !== params.source
					);
				}

				// Luôn xóa kết nối đến target node
				filteredEdges = filteredEdges.filter(
					(edge) => edge.target !== params.target
				);

				// Thêm edge mới vào danh sách đã lọc
				return [...filteredEdges, newEdge];
			});
		},
		[setEdges]
	);

	// Handle node selection
	const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
		setSelectedNode(node);
		setShowPropertiesPanel(true);
	}, []);

	// Handle background click (deselect nodes)
	const onPaneClick = useCallback(() => {
		setSelectedNode(null);
		setShowPropertiesPanel(false);
	}, []);

	// Update node data when properties change
	const onNodeDataChange = useCallback(
		(id: string, data: any) => {
			setNodes((nds) =>
				nds.map((node) => {
					if (node.id === id) {
						return { ...node, data: { ...data } };
					}
					return node;
				})
			);
		},
		[setNodes]
	);

	// Handle drag start from sidebar
	const onDragStart = (event: React.DragEvent, nodeType: string) => {
		event.dataTransfer.setData("application/reactflow", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	// Xử lý đổi tên flow
	const handleRenameFlow = (newName: string) => {
		setFlowName(newName);

		// Cập nhật tên flow nếu đã có flowId
		if (flowId) {
			setLoading(true);
			const flowUpdateData = {
				flowName: newName,
				nodeData: reactFlowInstance ? reactFlowInstance.toObject() : {},
			};

			updateFlow(flowId, flowUpdateData)
				.then((response) => {
					console.log("Flow đã được đổi tên thành công:", response);
				})
				.catch((error) => {
					console.error("Error updating flow name:", error);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	};

	// Save the current flow
	const onSave = useCallback(() => {
		if (reactFlowInstance) {
			setLoading(true);
			const flowData = reactFlowInstance.toObject();
			localStorage.setItem("flow-data", JSON.stringify(flowData));

			// Lưu flow vào cơ sở dữ liệu
			if (flowId) {
				// Cập nhật flow hiện tại
				const flowUpdateData = {
					flowName: flowName,
					nodeData: flowData,
				};

				updateFlow(flowId, flowUpdateData)
					.then((response) => {
						console.log("Flow updated successfully:", response);
					})
					.catch((error) => {
						console.error("Error updating flow:", error);
					})
					.finally(() => {
						setLoading(false);
					});
			} else {
				// Tạo flow mới
				const newFlowData = {
					name: flowName,
					nodeData: flowData,
				};

				createFlow(newFlowData)
					.then((response) => {
						console.log("Flow created successfully:", response);
						// Redirect to the flow editor with the new flow ID
						if (response && response._id) {
							window.location.href = `/pages/customflow?id=${response._id}`;
						}
					})
					.catch((error) => {
						console.error("Error creating flow:", error);
					})
					.finally(() => {
						setLoading(false);
					});
			}
		}
	}, [reactFlowInstance, flowId, flowName]);

	// Load a saved flow
	const onLoad = useCallback(() => {
		const savedFlow = localStorage.getItem("flow-data");
		if (savedFlow) {
			try {
				const flowData = JSON.parse(savedFlow) as FlowData;

				// Ensure edges have the correct data format
				const typedEdges = flowData.edges.map((edge) => {
					return {
						...edge,
						data: edge.data || { label: "Connection" },
					} as Edge<CustomEdgeData>;
				});

				setNodes(flowData.nodes);
				setEdges(typedEdges);

				// MUI toast equivalent will be added
			} catch (error) {
				console.error("Error loading flow:", error);
				// MUI toast equivalent will be added
			}
		} else {
			// MUI toast equivalent will be added
		}
	}, [setNodes, setEdges]);

	// Export flow as JSON
	const onExport = useCallback(() => {
		if (reactFlowInstance) {
			const flowData = reactFlowInstance.toObject();
			const jsonString = JSON.stringify(flowData, null, 2);
			const blob = new Blob([jsonString], { type: "application/json" });
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = "flow-export.json";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// toast({
			//   title: 'Flow Exported',
			//   description: 'Your flow has been exported as JSON.',
			//   variant: 'default',
			// });
		}
	}, [reactFlowInstance]);

	// Clear the current flow
	const onClear = useCallback(() => {
		setNodes([]);
		setEdges([]);
		setSelectedNode(null);
		setShowPropertiesPanel(false);
		// toast({
		//   title: 'Flow Cleared',
		//   description: 'Your flow has been cleared.',
		//   variant: 'default',
		// });
	}, [setNodes, setEdges]);

	// Simulate running the flow
	const onRun = useCallback(() => {
		if (nodes.length === 0) {
			// toast({
			//   title: 'Empty Flow',
			//   description: 'Please add nodes to your flow before running.',
			//   variant: 'destructive',
			// });
			return;
		}

		setIsRunning(true);
		setProgressPercent(0);

		// Simulate progress
		const totalSteps = 20;
		let currentStep = 0;

		const interval = setInterval(() => {
			currentStep += 1;
			setProgressPercent((currentStep / totalSteps) * 100);

			if (currentStep >= totalSteps) {
				clearInterval(interval);
				setIsRunning(false);
				// toast({
				//   title: 'Flow Execution Complete',
				//   description: 'Your flow has been executed successfully.',
				//   variant: 'default',
				// });
			}
		}, 150);
	}, [nodes]);

	const toggleMiniMap = () => {
		setShowMiniMap(!showMiniMap);
	};

	return (
		<Box
			sx={{
				width: "100%",
				height: "100vh",
				display: "flex",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Sidebar with node types */}
			<Sidebar onDragStart={onDragStart} />

			{/* Flow editor */}
			<Box ref={reactFlowWrapper} sx={{ flexGrow: 1, height: "100%" }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onInit={setReactFlowInstance}
					onDrop={onDrop}
					onDragOver={onDragOver}
					onNodeClick={onNodeClick}
					onPaneClick={onPaneClick}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					defaultEdgeOptions={defaultEdgeOptions}
					fitView
					snapToGrid
					snapGrid={[10, 10]}
					attributionPosition="bottom-left"
					proOptions={{ hideAttribution: true }}
				>
					<Background gap={20} size={1.5} color="#e2e8f0" />
					<Controls
						position="bottom-right"
						style={{
							marginBottom: 20,
							marginRight: 20,
							padding: 5,
							borderRadius: 12,
						}}
					/>

					{showMiniMap && (
						<MiniMap
							nodeStrokeWidth={3}
							nodeColor={(node) => {
								switch (node.type) {
									case "googleSheets":
									case "facebookLeadAds":
										return "#3B82F6";
									case "aiCall":
									case "sendWebhook":
									case "googleCalendar":
										return "#10B981";
									case "condition":
										return "#F59E0B";
									case "email":
									case "sms":
										return "#EC4899";
									default:
										return "#94A3B8";
								}
							}}
							style={{
								marginBottom: 20,
								marginRight: 20,
								borderRadius: 12,
							}}
						/>
					)}

					{/* Toggle MiniMap Button */}
					<Panel
						position="bottom-right"
						style={{ marginBottom: 140, marginRight: 20 }}
					>
						<Tooltip
							title={showMiniMap ? "Hide MiniMap" : "Show MiniMap"}
							placement="left"
						>
							<IconButton
								onClick={toggleMiniMap}
								className="lead-board"
								sx={{
									backdropFilter: "blur(12px)",
									borderRadius: "10px",
									width: "40px",
									height: "40px",
									"&:hover": {
										boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
									},
								}}
							>
								{showMiniMap ? (
									<VisibilityOff color="primary" />
								) : (
									<MapIcon color="primary" />
								)}
							</IconButton>
						</Tooltip>
					</Panel>

					{/* Toggle Theme Button */}
					{isRunning && (
						<Box
							sx={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								zIndex: 20,
							}}
						>
							<LinearProgress
								variant="determinate"
								value={progressPercent}
								sx={{
									height: 6,
									borderRadius: "0 0 4px 4px",
									"& .MuiLinearProgress-bar": {
										backgroundImage:
											"linear-gradient(to right, #3b82f6, #10b981)",
									},
								}}
							/>
						</Box>
					)}

					{/* Flow toolbar */}
					<Panel position="top-right">
						<FlowToolbar
							onSave={onSave}
							onLoad={onLoad}
							onExport={onExport}
							onClear={onClear}
							onRun={onRun}
							flowName={flowName}
							onRename={handleRenameFlow}
						/>
					</Panel>
				</ReactFlow>
			</Box>

			{/* Properties panel */}
			{showPropertiesPanel && (
				<PropertiesPanel
					selectedNode={selectedNode}
					onChange={onNodeDataChange}
					onClose={() => setShowPropertiesPanel(false)}
					flowId={flowId || undefined}
					flowName={flowName}
				/>
			)}

			{/* Loading indicator */}
			<Backdrop
				sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={loading}
			>
				<CircularProgress color="inherit" />
			</Backdrop>

			{/* Alert Messages */}
			<Snackbar
				open={alertInfo.open}
				autoHideDuration={4000}
				onClose={() => setAlertInfo((prev) => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setAlertInfo((prev) => ({ ...prev, open: false }))}
					severity={alertInfo.severity}
					variant="filled"
					sx={{
						borderRadius: 2,
						boxShadow: 4,
						width: "100%",
					}}
				>
					{alertInfo.message}
				</Alert>
			</Snackbar>
		</Box>
	);
};

// Wrap the component with ReactFlowProvider and ThemeProvider
const FlowEditor: React.FC<FlowEditorProps> = ({ flowId }) => {
	const { isDarkMode } = useTheme();
	const theme = isDarkMode ? getDarkTheme() : getLightTheme();

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				sx={{
					height: "100vh",
					width: "100%",
					overflow: "hidden",
				}}
			>
				<ReactFlowProvider>
					<FlowEditorContent flowId={flowId} />
				</ReactFlowProvider>
			</Box>
		</ThemeProvider>
	);
};

export default FlowEditor;
