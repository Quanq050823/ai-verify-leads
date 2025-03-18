
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Paper, Typography, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

type BaseNodeProps = {
  data: {
    label: string;
    icon?: React.ReactNode;
    description?: string;
    type: string;
    subType?: string;
    inputs?: number;
    outputs?: number;
    color?: string;
  };
  selected: boolean;
  id: string;
};

const NodeContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'nodeColor',
})<{ selected?: boolean; nodeColor?: string }>(({ theme, selected, nodeColor }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1.5),
  width: '200px',
  border: selected ? `1px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  boxShadow: selected ? theme.shadows[3] : theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['box-shadow', 'border-color'], {
    duration: theme.transitions.duration.short,
  }),
  animation: selected ? 'fadeIn 0.3s ease-out' : 'none',
  '&.selected': {
    borderColor: theme.palette.primary.main,
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'scale(0.9)',
    },
    to: {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
}));

const NodeHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const NodeIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgcolor',
})<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: bgcolor || theme.palette.grey[400],
  color: 'white',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  marginRight: theme.spacing(1),
  width: '28px',
  height: '28px',
}));

const NodeFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(1.5),
  paddingTop: theme.spacing(0.75),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.grey[300],
  border: `2px solid ${theme.palette.grey[400]}`,
  width: '8px',
  height: '8px',
  '&:hover': {
    background: 'white',
    borderColor: theme.palette.primary.main,
  },
}));

const BaseNode = ({ data, selected, id }: BaseNodeProps) => {
  const nodeColor = data.color || '#94a3b8';
  
  // Determine the number of input and output handles
  const inputCount = data.inputs !== undefined ? data.inputs : 1;
  const outputCount = data.outputs !== undefined ? data.outputs : 1;
  
  // Calculate positions for multiple handles
  const getHandlePositions = (count: number) => {
    if (count === 1) return [0.5]; // Center if only one
    
    const positions: number[] = [];
    for (let i = 0; i < count; i++) {
      positions.push((i / (count - 1)) * 0.8 + 0.1); // Distribute between 0.1 and 0.9
    }
    return positions;
  };
  
  const inputPositions = getHandlePositions(inputCount);
  const outputPositions = getHandlePositions(outputCount);

  return (
    <NodeContainer selected={selected} className={selected ? 'selected fade-in' : ''}>
      <NodeHeader>
        <NodeIcon bgcolor={nodeColor}>
          {data.icon || '●'}
        </NodeIcon>
        <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
          {data.label}
        </Typography>
      </NodeHeader>
      
      <Box sx={{ mb: 1 }}>
        {data.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {data.description}
          </Typography>
        )}
        <Stack direction="row" spacing={0.5}>
          <Chip 
            label={data.type} 
            size="small" 
            sx={{ 
              bgcolor: 'grey.100', 
              color: 'text.secondary',
              height: '20px',
              '& .MuiChip-label': {
                fontSize: '0.625rem',
                px: 1,
              }
            }} 
          />
          {data.subType && (
            <Chip 
              label={data.subType} 
              size="small" 
              sx={{ 
                bgcolor: 'grey.100', 
                color: 'text.secondary',
                height: '20px',
                '& .MuiChip-label': {
                  fontSize: '0.625rem',
                  px: 1,
                }
              }} 
            />
          )}
        </Stack>
      </Box>
      
      <NodeFooter>
        <Typography variant="caption" color="text.secondary">
          ID: {id.slice(0, 8)}
        </Typography>
      </NodeFooter>
      
      {/* Input Handles */}
      {inputPositions.map((pos, index) => (
        <StyledHandle
          key={`input-${index}`}
          type="target"
          position={Position.Left}
          id={`input-${index}`}
          style={{ left: 0, top: `${pos * 100}%` }}
        />
      ))}
      
      {/* Output Handles */}
      {outputPositions.map((pos, index) => (
        <StyledHandle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={`output-${index}`}
          style={{ right: 0, top: `${pos * 100}%` }}
        />
      ))}
    </NodeContainer>
  );
};

export default memo(BaseNode);
