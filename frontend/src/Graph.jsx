import React, { useCallback, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'react-flow-renderer';
import './Graph.css';

const initialNodes = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Node 1', description: 'Описание 1' },
  },
  {
    id: '2',
    position: { x: 100, y: 200 },
    data: { label: 'Node 2', description: 'Описание 2' },
  },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

function GraphFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const { project } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleContextMenu = (event) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const newNode = {
      id: `${+new Date()}`,
      data: {
        label: `Node ${nodes.length + 1}`,
        description: 'Описание по умолчанию',
      },
      position,
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  return (
    <div className="graph-wrapper">
      <div className="flow-canvas" onContextMenu={handleContextMenu}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        />
      </div>

      {selectedNode && (
        <div className="sidebar">
          <h3>{selectedNode.data.label}</h3>
          <p>{selectedNode.data.description}</p>
        </div>
      )}
    </div>
  );
}

export default function Graph() {
  return (
    <ReactFlowProvider>
      <GraphFlow />
    </ReactFlowProvider>
  );
}
