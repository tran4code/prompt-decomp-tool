import { TestCase } from '../types';

export function generateCodeFromPrompt(prompt: string): {
  generatedCode: string;
  description: string;
  functionName: string;
} {
  if (!prompt.trim()) {
    return {
      generatedCode: '',
      description: '',
      functionName: 'new_function'
    };
  }

  // Simple prompt-to-code mapping (in a real implementation, this would use an LLM)
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('filter') && promptLower.includes('odd')) {
    return {
      generatedCode: `def filter_odd_numbers(numbers):
    """Filter out odd numbers from a list."""
    return [x for x in numbers if x % 2 == 0]`,
      description: 'Filters out odd numbers from a list, returning only even numbers.',
      functionName: 'filter_odd_numbers'
    };
  }
  
  if (promptLower.includes('square') || promptLower.includes('power')) {
    return {
      generatedCode: `def square_numbers(numbers):
    """Square each number in a list."""
    return [x ** 2 for x in numbers]`,
      description: 'Squares each number in the input list.',
      functionName: 'square_numbers'
    };
  }
  
  if (promptLower.includes('sum') || promptLower.includes('add')) {
    return {
      generatedCode: `def sum_numbers(numbers):
    """Sum all numbers in a list."""
    return sum(numbers)`,
      description: 'Calculates the sum of all numbers in a list.',
      functionName: 'sum_numbers'
    };
  }
  
  if (promptLower.includes('positive') || promptLower.includes('greater than')) {
    return {
      generatedCode: `def filter_positive_numbers(numbers):
    """Filter positive numbers from a list."""
    return [x for x in numbers if x > 0]`,
      description: 'Filters positive numbers from a list.',
      functionName: 'filter_positive_numbers'
    };
  }
  
  if (promptLower.includes('double') || promptLower.includes('multiply by 2')) {
    return {
      generatedCode: `def double_numbers(numbers):
    """Double each number in a list."""
    return [x * 2 for x in numbers]`,
      description: 'Doubles each number in the input list.',
      functionName: 'double_numbers'
    };
  }
  
  if (promptLower.includes('sort') || promptLower.includes('order')) {
    return {
      generatedCode: `def sort_numbers(numbers):
    """Sort numbers in ascending order."""
    return sorted(numbers)`,
      description: 'Sorts numbers in ascending order.',
      functionName: 'sort_numbers'
    };
  }
  
  if (promptLower.includes('reverse')) {
    return {
      generatedCode: `def reverse_list(items):
    """Reverse the order of items in a list."""
    return list(reversed(items))`,
      description: 'Reverses the order of items in a list.',
      functionName: 'reverse_list'
    };
  }
  
  // Default case - create a simple template
  const functionName = promptLower.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 20) || 'custom_function';
  
  return {
    generatedCode: `def ${functionName}(input_data):
    """${prompt}"""
    # TODO: Implement the function based on the prompt
    return input_data`,
    description: `Function that: ${prompt}`,
    functionName: functionName
  };
}

export function executeTests(code: string, testCases: TestCase[], inputOverride?: string): TestCase[] {
  return testCases.map(testCase => {
    try {
      // Determine which input to use based on the toggle setting
      let inputToUse = testCase.input; // Default to manual input
      
      if (testCase.useConnectedInput && inputOverride) {
        inputToUse = inputOverride; // Use connected input if toggle is on and override is available
      }
      
      const actualOutput = simulateExecution(code, inputToUse);
      const passed = actualOutput === testCase.expectedOutput;
      
      return {
        ...testCase,
        actualOutput,
        passed,
        input: inputToUse // Update the input to show what was actually used
      };
    } catch (error) {
      return {
        ...testCase,
        actualOutput: `Error: ${error}`,
        passed: false
      };
    }
  });
}

function simulateExecution(code: string, input: string): string {
  // This is a simplified simulation of code execution
  // In a real implementation, you'd use a safe Python interpreter
  
  try {
    const inputValue = JSON.parse(input);
    
    if (code.includes('filter_odd_numbers')) {
      if (Array.isArray(inputValue)) {
        const result = inputValue.filter(x => x % 2 === 0);
        return JSON.stringify(result);
      }
    }
    
    if (code.includes('square_numbers')) {
      if (Array.isArray(inputValue)) {
        const result = inputValue.map(x => x ** 2);
        return JSON.stringify(result);
      }
    }
    
    if (code.includes('sum_numbers')) {
      if (Array.isArray(inputValue)) {
        const result = inputValue.reduce((sum, x) => sum + x, 0);
        return JSON.stringify(result);
      }
    }
    
    if (code.includes('filter_positive_numbers')) {
      if (Array.isArray(inputValue)) {
        const result = inputValue.filter(x => x > 0);
        return JSON.stringify(result);
      }
    }
    
    if (code.includes('double_numbers')) {
      if (Array.isArray(inputValue)) {
        const result = inputValue.map(x => x * 2);
        return JSON.stringify(result);
      }
    }
    
    if (code.includes('sort_numbers')) {
      if (Array.isArray(inputValue)) {
        const result = [...inputValue].sort((a, b) => a - b);
        return JSON.stringify(result);
      }
    }
    
    if (code.includes('reverse_list')) {
      if (Array.isArray(inputValue)) {
        const result = [...inputValue].reverse();
        return JSON.stringify(result);
      }
    }
    
    // Default case - return the input
    return input;
  } catch (error) {
    return `Error: Invalid input format`;
  }
}