import React, { useState, useCallback, useRef } from "react";
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
import {
	Box,
	CssBaseline,
	LinearProgress,
	ThemeProvider,
	createTheme,
} from "@mui/material";

import Sidebar from "./Sidebar";
import PropertiesPanel from "./PropertiesPanel";
import CustomEdge from "./edges/CustomEdge";
import FlowToolbar from "./FlowToolbar";
import {
	GoogleSheetsNode,
	FacebookAdsNode,
	AICallNode,
	CalendarNode,
	WebhookNode,
	ConditionNode,
	EmailNode,
	SMSNode,
	ConfigNode,
	ErrorNode,
} from "./nodes/NodeTypes";
import { CustomEdgeData } from "./edges/CustomEdge";

// Define theme for MUI
const theme = createTheme({
	palette: {
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

// Define node types
const nodeTypes = {
	googleSheets: GoogleSheetsNode,
	facebookAds: FacebookAdsNode,
	aiCall: AICallNode,
	calendar: CalendarNode,
	webhook: WebhookNode,
	condition: ConditionNode,
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

const FlowEditorContent = () => {
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

	const reactFlowUtil = useReactFlow();

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
			case "facebookAds":
				return "Facebook Ads";
			case "aiCall":
				return "AI Call";
			case "calendar":
				return "Google Calendar";
			case "webhook":
				return "Webhook";
			case "condition":
				return "Condition";
			case "email":
				return "Send Email";
			case "sms":
				return "Send SMS";
			case "config":
				return "Configuration";
			case "error":
				return "Error Handler";
			default:
				return "Unknown Node";
		}
	};

	// Helper function to get node description based on type
	const getNodeDescription = (type: string): string => {
		switch (type) {
			case "googleSheets":
				return "Import leads from Google Sheets";
			case "facebookAds":
				return "Import leads from Facebook Ads";
			case "aiCall":
				return "Process data with AI";
			case "calendar":
				return "Schedule appointments";
			case "webhook":
				return "Send data to external system";
			case "condition":
				return "Branch based on conditions";
			case "email":
				return "Send email notification";
			case "sms":
				return "Send SMS notification";
			case "config":
				return "Configure flow settings";
			case "error":
				return "Handle errors in the flow";
			default:
				return "";
		}
	};

	// Handle connection between nodes
	const onConnect = useCallback(
		(params: Connection) => {
			// Create a new edge with CustomEdgeData
			const newEdge: Edge<CustomEdgeData> = {
				...params,
				id: `e_${params.source}_${params.target}_${Date.now()}`,
				data: { label: "Connection" },
			};
			setEdges((eds) => addEdge(newEdge, eds));
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

	// Save the current flow
	const onSave = useCallback(() => {
		if (reactFlowInstance) {
			const flowData = reactFlowInstance.toObject();
			localStorage.setItem("flow-data", JSON.stringify(flowData));
			// MUI toast equivalent will be added
		}
	}, [reactFlowInstance]);

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

	return (
		<Box
			sx={{
				width: "100%",
				height: "100vh",
				display: "flex",
				position: "relative",
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
				>
					<Background gap={12} size={1} color="#f1f1f1" />
					<Controls />
					<MiniMap
						nodeStrokeWidth={3}
						nodeColor={(node) => {
							switch (node.type) {
								case "googleSheets":
								case "facebookAds":
									return "#3B82F6";
								case "aiCall":
								case "webhook":
								case "calendar":
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
						maskColor="rgba(240, 240, 240, 0.6)"
					/>

					{/* Flow execution progress bar */}
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
							<LinearProgress variant="determinate" value={progressPercent} />
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
				/>
			)}
		</Box>
	);
};

// Wrap the component with ReactFlowProvider and ThemeProvider
const FlowEditor: React.FC = () => {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				sx={{
					height: "100vh",
					width: "100%",
					overflow: "hidden",
					bgcolor: "grey.50",
				}}
			>
				<ReactFlowProvider>
					<FlowEditorContent />
				</ReactFlowProvider>
			</Box>
		</ThemeProvider>
	);
};

export default FlowEditor;
