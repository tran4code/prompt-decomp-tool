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

export interface CSVBlockData {
  id: string;
  csvData: any[] | null;
  fileName: string;
  preview: string;
  position: { x: number; y: number };
}

export interface CanvasState {
  blocks: FunctionBlockData[];
  csvBlocks: CSVBlockData[];
  connections: ConnectionData[];
  zoom: number;
}