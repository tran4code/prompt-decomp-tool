import { CanvasState } from '../types';

const STORAGE_KEY = 'prompt-programming-env-canvas';

export function saveCanvasState(state: CanvasState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save canvas state:', error);
  }
}

export function loadCanvasState(): CanvasState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load canvas state:', error);
    return null;
  }
}

export function clearCanvasState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear canvas state:', error);
  }
}

export function exportCanvasState(state: CanvasState): string {
  return JSON.stringify(state, null, 2);
}

export function importCanvasState(jsonString: string): CanvasState | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Basic validation
    if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
      throw new Error('Invalid canvas state: missing blocks array');
    }
    
    if (!parsed.connections || !Array.isArray(parsed.connections)) {
      throw new Error('Invalid canvas state: missing connections array');
    }
    
    return parsed as CanvasState;
  } catch (error) {
    console.error('Failed to import canvas state:', error);
    return null;
  }
}