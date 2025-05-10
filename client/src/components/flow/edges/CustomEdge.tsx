import React from "react";
import {
	BaseEdge,
	EdgeLabelRenderer,
	getBezierPath,
	useReactFlow,
	EdgeProps,
} from "@xyflow/react";
import { Button, Box, Typography, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

// Define the interface for edge data
export interface CustomEdgeData {
	label: string;
	[key: string]: unknown;
}

// Define the edge props that extend the base EdgeProps
export interface CustomEdgeProps extends Omit<EdgeProps, "data"> {
	data?: CustomEdgeData;
}

const EdgeButton = styled(Button)(({ theme }) => ({
	minWidth: "24px",
	width: "24px",
	height: "24px",
	padding: 0,
	borderRadius: "50%",
	backgroundColor: "white",
	color: theme.palette.grey[500],
	boxShadow: theme.shadows[1],
	border: `1px solid ${theme.palette.grey[200]}`,
	marginTop: "4px",
	marginLeft: "auto",
	marginRight: "auto",
	"&:hover": {
		backgroundColor: theme.palette.grey[50],
		color: theme.palette.grey[700],
	},
}));

const EdgeLabel = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(0.5, 1),
	backdropFilter: "blur(4px)",
	borderRadius: theme.shape.borderRadius,
	boxShadow: theme.shadows[1],
	border: `1px solid ${theme.palette.grey[100]}`,
	fontSize: "0.75rem",
}));

const CustomEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	data,
}: CustomEdgeProps) => {
	const { setEdges } = useReactFlow();
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const onEdgeClick = (
		evt: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		evt.stopPropagation();
		setEdges((edges) => edges.filter((edge) => edge.id !== id));
	};

	return (
		<>
			<BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
			<EdgeLabelRenderer>
				<Box
					sx={{
						position: "absolute",
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						pointerEvents: "all",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
					className="nodrag nopan"
				>
					{data?.label && (
						<EdgeLabel>
							<Typography variant="caption">{data.label}</Typography>
						</EdgeLabel>
					)}
					<EdgeButton size="small" onClick={onEdgeClick}>
						×
					</EdgeButton>
				</Box>
			</EdgeLabelRenderer>
		</>
	);
};

export default CustomEdge;
