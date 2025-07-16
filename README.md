# Prompt-Based Programming Environment

A React application that allows users to build Python programs using modular visual blocks, each representing a single function created through natural language prompts.

## Features

🧩 **Function Blocks**: Each block contains:
- User-written natural language prompt
- Auto-generated Python function code
- Brief description of functionality
- Test cases with input/output validation
- Pass/fail indicators

🔗 **Visual Composition**: 
- Drag and connect blocks to create function pipelines
- Output of one block becomes input of the next
- Visual flowchart-style connections

🧭 **Zoomable Canvas**:
- Zoom out: Compact view with function name and test status
- Zoom in: Detailed view with full code, prompts, and test cases
- Controls for navigation and mini-map

⚙️ **Interactive Features**:
- Click blocks to edit prompts and test cases
- Auto-save to localStorage
- Regenerate code from updated prompts
- Real-time test execution and validation

## Getting Started

1. **Installation**:
   ```bash
   npm install
   ```

2. **Run the application**:
   ```bash
   npm start
   ```

3. **Open your browser** to `http://localhost:3000`

## How to Use

1. **Create a Function Block**:
   - Click the "+ Add Function Block" button
   - Click on the prompt area to edit
   - Enter a natural language description (e.g., "Filter odd numbers and square them")
   - Click "Regenerate" to generate Python code

2. **Add Test Cases**:
   - Click "Expand" in the test cases section
   - Click "+ Add Test Case"
   - Enter input and expected output
   - The system will automatically run tests and show pass/fail status

3. **Connect Blocks**:
   - Drag from the right handle of one block to the left handle of another
   - Connected blocks will pass data through the pipeline

4. **Navigate the Canvas**:
   - Use mouse wheel to zoom in/out
   - Drag to pan around the canvas
   - Use the mini-map for quick navigation

## Example Prompts

Try these example prompts to see the system in action:

- "Filter odd numbers from a list"
- "Square each number in a list"
- "Sum all numbers in a list"
- "Filter positive numbers"
- "Double each number"
- "Sort numbers in ascending order"
- "Reverse the order of items"

## Example Test Cases

For a "filter odd numbers" function:
- Input: `[1, 2, 3, 4, 5, 6]`
- Expected Output: `[2, 4, 6]`

For a "square numbers" function:
- Input: `[1, 2, 3, 4]`
- Expected Output: `[1, 4, 9, 16]`

## Technical Implementation

- **React + TypeScript**: Core framework
- **React Flow**: Canvas and node management
- **localStorage**: Persistent storage
- **Simulated Code Generation**: Pattern matching for common operations
- **Real-time Test Execution**: JavaScript simulation of Python functions

## Architecture

```
src/
├── components/
│   ├── Canvas.tsx          # Main canvas with React Flow
│   └── FunctionBlock.tsx   # Individual function block component
├── types.ts                # TypeScript interfaces
├── utils/
│   ├── codeGeneration.ts   # Prompt-to-code conversion
│   └── storage.ts          # localStorage utilities
└── App.tsx                 # Main application
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Future Enhancements

- Integration with real Python execution environment
- LLM-based code generation (OpenAI/Anthropic APIs)
- Export to actual Python files
- More sophisticated test frameworks
- Collaborative editing features
- Template library for common functions

## Contributing

This is a prototype implementation. The code generation currently uses pattern matching for demonstration purposes. In a production environment, you would integrate with:

- Python execution sandboxes (PyOdide, Skulpt)
- Large Language Models for code generation
- More sophisticated test frameworks
- Real-time collaboration features