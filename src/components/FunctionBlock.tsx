import React, { useState, memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { FunctionBlockData, TestCase } from '../types';

interface FunctionBlockProps extends NodeProps {
  data: FunctionBlockData & {
    onPromptChange: (id: string, prompt: string) => void;
    onTestCaseChange: (id: string, testCases: TestCase[]) => void;
    onRegenerate: (id: string) => void;
    isConnected?: boolean;
    connectedInput?: string;
  };
}

const FunctionBlock = memo(({ data, selected }: FunctionBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(data.prompt);
  const [isExpanded, setIsExpanded] = useState(false);
  const reactFlowInstance = useReactFlow();
  const zoom = reactFlowInstance.getZoom();

  const passedTests = data.testCases.filter(tc => tc.passed).length;
  const totalTests = data.testCases.length;
  const testStatus = totalTests === 0 ? 'none' : passedTests === totalTests ? 'pass' : 'fail';

  const handleSavePrompt = () => {
    data.onPromptChange(data.id, editingPrompt);
    setIsEditing(false);
  };

  const handleAddTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      input: '',
      expectedOutput: '',
    };
    data.onTestCaseChange(data.id, [...data.testCases, newTestCase]);
  };

  const handleUpdateTestCase = (testId: string, field: 'input' | 'expectedOutput' | 'useConnectedInput', value: string | boolean) => {
    const updatedTestCases = data.testCases.map(tc => 
      tc.id === testId ? { ...tc, [field]: value } : tc
    );
    data.onTestCaseChange(data.id, updatedTestCases);
  };

  const handleDeleteTestCase = (testId: string) => {
    const updatedTestCases = data.testCases.filter(tc => tc.id !== testId);
    data.onTestCaseChange(data.id, updatedTestCases);
  };

  const getStatusColor = () => {
    switch (testStatus) {
      case 'pass': return '#10B981';
      case 'fail': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      default: return '⚪';
    }
  };

  // Determine if we should show detailed or summary view based on zoom level
  const showDetailedView = zoom > 0.5;
  const showSummaryView = zoom <= 0.3;

  if (showSummaryView) {
    // Ultra-compact view for very zoomed out
    return (
      <div 
        className={`function-block ${selected ? 'selected' : ''}`}
        style={{
          border: `2px solid ${getStatusColor()}`,
          borderRadius: '6px',
          background: 'white',
          minWidth: '80px',
          maxWidth: '120px',
          padding: '6px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          fontSize: '10px'
        }}
      >
        <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '8px' }}>{data.functionName}</div>
          <div style={{ fontSize: '8px' }}>{getStatusIcon()} {totalTests > 0 ? `${passedTests}/${totalTests}` : '0'}</div>
        </div>
        <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      </div>
    );
  }

  return (
    <div 
      className={`function-block ${selected ? 'selected' : ''}`}
      style={{
        border: `2px solid ${getStatusColor()}`,
        borderRadius: '8px',
        background: 'white',
        minWidth: showDetailedView ? '250px' : '180px',
        maxWidth: showDetailedView ? '400px' : '280px',
        padding: showDetailedView ? '12px' : '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: showDetailedView ? '12px' : '10px'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left}
        style={{ background: '#555' }}
      />
      
      <div className="block-header" style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
            {data.functionName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{getStatusIcon()}</span>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {totalTests > 0 ? `${passedTests}/${totalTests}` : 'No tests'}
            </span>
          </div>
        </div>
      </div>

      <div className="block-content">
        <div className="prompt-section" style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
            Prompt:
          </label>
          {isEditing ? (
            <div>
              <textarea
                value={editingPrompt}
                onChange={(e) => setEditingPrompt(e.target.value)}
                style={{ width: '100%', minHeight: '60px', fontSize: '12px', padding: '4px' }}
              />
              <div style={{ marginTop: '4px' }}>
                <button onClick={handleSavePrompt} style={{ marginRight: '4px', fontSize: '12px' }}>
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} style={{ fontSize: '12px' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              style={{ 
                fontSize: '12px', 
                padding: '4px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#f9f9f9'
              }}
            >
              {data.prompt || 'Click to add prompt...'}
            </div>
          )}
        </div>

        {data.isConnected && data.connectedInput && (
          <div className="connected-input-section" style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#3B82F6' }}>
              📥 Connected Input:
            </label>
            <div style={{ 
              fontSize: '11px', 
              color: '#3B82F6', 
              backgroundColor: '#EFF6FF',
              padding: '4px',
              border: '1px solid #BFDBFE',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>
              {data.connectedInput}
            </div>
          </div>
        )}

        {showDetailedView && (
          <div className="description-section" style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              Description:
            </label>
            <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
              {data.description || 'Generated description will appear here...'}
            </div>
          </div>
        )}

        {showDetailedView && (
          <div className="code-section" style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                Generated Code:
              </label>
              <button 
                onClick={() => data.onRegenerate(data.id)}
                style={{ fontSize: '10px', padding: '2px 6px' }}
              >
                Regenerate
              </button>
            </div>
            <pre style={{ 
              fontSize: '10px', 
              backgroundColor: '#f5f5f5', 
              padding: '6px', 
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '100px'
            }}>
              {data.generatedCode || 'No code generated yet...'}
            </pre>
          </div>
        )}

        <div className="test-cases-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
              Test Cases:
            </label>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ fontSize: '10px', padding: '2px 6px' }}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          {isExpanded && (
            <div>
              {data.testCases.map((testCase) => (
                <div key={testCase.id} style={{ 
                  border: '1px solid #ddd', 
                  padding: '6px', 
                  marginBottom: '4px',
                  borderRadius: '4px',
                  backgroundColor: testCase.passed ? '#f0f9ff' : testCase.passed === false ? '#fef2f2' : '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                      {testCase.passed ? '✅' : testCase.passed === false ? '❌' : '⚪'} Test Case
                    </span>
                    <button 
                      onClick={() => handleDeleteTestCase(testCase.id)}
                      style={{ fontSize: '10px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* Input Source Toggle - only show if block is connected */}
                  {data.isConnected && (
                    <div style={{ marginTop: '4px', padding: '4px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px' }}>
                      <label style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={testCase.useConnectedInput || false}
                          onChange={(e) => handleUpdateTestCase(testCase.id, 'useConnectedInput', e.target.checked)}
                          style={{ fontSize: '10px' }}
                        />
                        <span style={{ color: testCase.useConnectedInput ? '#3B82F6' : '#6B7280' }}>
                          {testCase.useConnectedInput ? '🔗 Use Connected Input' : '✏️ Use Manual Input'}
                        </span>
                      </label>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '4px' }}>
                    <label style={{ fontSize: '10px', display: 'block' }}>
                      Input:
                      {data.isConnected && testCase.useConnectedInput && (
                        <span style={{ color: '#3B82F6', fontSize: '9px', marginLeft: '4px' }}>
                          (from connected block)
                        </span>
                      )}
                    </label>
                    <input
                      value={testCase.input}
                      onChange={(e) => handleUpdateTestCase(testCase.id, 'input', e.target.value)}
                      disabled={data.isConnected && testCase.useConnectedInput}
                      style={{ 
                        width: '100%', 
                        fontSize: '10px', 
                        padding: '2px',
                        backgroundColor: (data.isConnected && testCase.useConnectedInput) ? '#f0f9ff' : 'white',
                        color: (data.isConnected && testCase.useConnectedInput) ? '#3B82F6' : 'black'
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <label style={{ fontSize: '10px', display: 'block' }}>Expected Output:</label>
                    <input
                      value={testCase.expectedOutput}
                      onChange={(e) => handleUpdateTestCase(testCase.id, 'expectedOutput', e.target.value)}
                      style={{ width: '100%', fontSize: '10px', padding: '2px' }}
                    />
                  </div>
                  {testCase.actualOutput && (
                    <div style={{ marginTop: '4px' }}>
                      <label style={{ fontSize: '10px', display: 'block' }}>Actual Output:</label>
                      <div style={{ fontSize: '10px', padding: '2px', backgroundColor: '#f0f0f0', border: '1px solid #ddd' }}>
                        {testCase.actualOutput}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button 
                onClick={handleAddTestCase}
                style={{ fontSize: '10px', padding: '4px 8px', width: '100%' }}
              >
                + Add Test Case
              </button>
            </div>
          )}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right}
        style={{ background: '#555' }}
      />
    </div>
  );
});

export default FunctionBlock;