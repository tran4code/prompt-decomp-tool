import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import FunctionBlock from './FunctionBlock';
import { FunctionBlockData, TestCase } from '../types';
import { generateCodeFromPrompt, executeTests } from '../utils/codeGeneration';
import { saveCanvasState, loadCanvasState } from '../utils/storage';

const nodeTypes: NodeTypes = {
  functionBlock: FunctionBlock,
};

const Canvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load canvas state on component mount
  useEffect(() => {
    const savedState = loadCanvasState();
    if (savedState) {
      const loadedNodes = savedState.blocks.map(block => ({
        id: block.id,
        type: 'functionBlock',
        position: block.position,
        data: block,
      }));
      
      const loadedEdges = savedState.connections.map(conn => ({
        id: conn.id,
        source: conn.sourceBlockId,
        target: conn.targetBlockId,
      }));
      
      setNodes(loadedNodes);
      setEdges(loadedEdges);
    }
  }, [setNodes, setEdges]);

  // Save canvas state when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const canvasState = {
        blocks: nodes.map(node => node.data as FunctionBlockData),
        connections: edges.map(edge => ({
          id: edge.id,
          sourceBlockId: edge.source,
          targetBlockId: edge.target,
        })),
        zoom: 1,
      };
      
      saveCanvasState(canvasState);
    }
  }, [nodes, edges]);

  const executeBlockWithConnections = useCallback((nodeId: string, allNodes: Node[], allEdges: any[]) => {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return null;

    // Find input connection (edge targeting this node)
    const inputEdge = allEdges.find(edge => edge.target === nodeId);
    let inputOverride = null;
    let isConnected = false;
    let connectedInput = null;

    if (inputEdge) {
      // Get the source block's output
      const sourceNode = allNodes.find(n => n.id === inputEdge.source);
      if (sourceNode && sourceNode.data.generatedCode) {
        // Use the first test case's actual output as input, or a default value
        const sourceOutput = sourceNode.data.testCases.length > 0 
          ? sourceNode.data.testCases[0].actualOutput 
          : '[]';
        inputOverride = sourceOutput;
        isConnected = true;
        connectedInput = sourceOutput;
      }
    }

    // Execute this block's tests with the input override
    const updatedData = { 
      ...node.data, 
      isConnected,
      connectedInput
    };

    if (node.data.generatedCode && node.data.testCases.length > 0) {
      const updatedTestCases = executeTests(node.data.generatedCode, node.data.testCases, inputOverride);
      updatedData.testCases = updatedTestCases;
    }

    return updatedData;
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => {
      const newEdges = addEdge(params, eds);
      
      // Re-execute all blocks after connection changes
      setTimeout(() => {
        setNodes((nds) => {
          return nds.map(node => {
            const executedData = executeBlockWithConnections(node.id, nds, newEdges);
            return { ...node, data: executedData || node.data };
          });
        });
      }, 0);
      
      return newEdges;
    });
  }, [setEdges, executeBlockWithConnections, setNodes]);

  const handlePromptChange = useCallback((id: string, prompt: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const updatedData = { ...node.data, prompt };
          return { ...node, data: updatedData };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleTestCaseChange = useCallback((id: string, testCases: TestCase[]) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === id) {
          const updatedData = { ...node.data, testCases };
          return { ...node, data: updatedData };
        }
        return node;
      });

      // Re-execute all blocks with their connections after test case changes
      // This will respect the new toggle settings
      return updatedNodes.map(node => {
        const executedData = executeBlockWithConnections(node.id, updatedNodes, edges);
        return { ...node, data: executedData || node.data };
      });
    });
  }, [setNodes, edges, executeBlockWithConnections]);

  const handleRegenerate = useCallback(async (id: string) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === id) {
          const { generatedCode, description, functionName } = generateCodeFromPrompt(node.data.prompt);
          const updatedData = { 
            ...node.data, 
            generatedCode, 
            description, 
            functionName 
          };
          
          return { ...node, data: updatedData };
        }
        return node;
      });

      // Now execute all blocks with their connections
      return updatedNodes.map(node => {
        const executedData = executeBlockWithConnections(node.id, updatedNodes, edges);
        return { ...node, data: executedData || node.data };
      });
    });
  }, [setNodes, edges, executeBlockWithConnections]);

  const addNewBlock = useCallback(() => {
    const newId = `block-${Date.now()}`;
    const newBlockData: FunctionBlockData = {
      id: newId,
      prompt: '',
      generatedCode: '',
      description: '',
      testCases: [],
      functionName: 'new_function',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };

    const newNode: Node = {
      id: newId,
      type: 'functionBlock',
      position: newBlockData.position,
      data: {
        ...newBlockData,
        onPromptChange: handlePromptChange,
        onTestCaseChange: handleTestCaseChange,
        onRegenerate: handleRegenerate,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, handlePromptChange, handleTestCaseChange, handleRegenerate]);

  const nodeData = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onPromptChange: handlePromptChange,
        onTestCaseChange: handleTestCaseChange,
        onRegenerate: handleRegenerate,
      },
    }));
  }, [nodes, handlePromptChange, handleTestCaseChange, handleRegenerate]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 1000,
        background: 'white',
        padding: '8px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={addNewBlock}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          + Add Function Block
        </button>
      </div>

      <ReactFlow
        nodes={nodeData}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background color="#f0f0f0" gap={16} />
        <MiniMap 
          nodeColor={(node) => {
            const testCases = node.data?.testCases || [];
            const passedTests = testCases.filter((tc: TestCase) => tc.passed).length;
            const totalTests = testCases.length;
            
            if (totalTests === 0) return '#6B7280';
            return passedTests === totalTests ? '#10B981' : '#EF4444';
          }}
          nodeStrokeWidth={3}
          pannable
          zoomable
          style={{
            height: 120,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default Canvas;