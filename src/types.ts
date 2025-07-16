export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  useConnectedInput?: boolean; // Toggle for using connected input vs manual input
}

export interface FunctionBlockData {
  id: string;
  prompt: string;
  generatedCode: string;
  description: string;
  testCases: TestCase[];
  functionName: string;
  position: { x: number; y: number };
}

export interface ConnectionData {
  id: string;
  sourceBlockId: string;
  targetBlockId: string;
}

export interface CanvasState {
  blocks: FunctionBlockData[];
  connections: ConnectionData[];
  zoom: number;
}